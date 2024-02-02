import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PublicUtils } from '@$/utils/public-utils';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ObjectId } from 'mongodb';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AdminDocument } from '../admin/schemas/admin.schema';
import { BlogRating, BlogRatingDocument } from './schema/blog-rating.schema';
import { RatingBlog } from './dto/rating-blog.dto';
import { blogDocument } from './schema/blog.schema';
import { QueryBlog, QueryBlogByAdmin } from './dto/query-blog.dto';
import { BlogView, BlogViewDocument } from './schema/blog-view.schema';
import { blogCommentDocument } from './schema/comment-blog.schema';
import { CreateCommentBlogDto } from './dto/create-comment-blog.dto';
import { UpdateCommentBlogDto } from './dto/update-comment-blog.dto';
import { statusBlog, statusBlogComment } from '@$/types/status.types';
import { QueryBlogCommentByAdminDto } from './dto/query-blog-comment-admin.dto';
import { categoryBlogDocument } from '../categoryBlog/categoryBlog.schema';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel('blogs') private blogModel: Model<blogDocument>,
    @InjectModel('blogs') private categoryBlogModel: Model<categoryBlogDocument>,
    @InjectModel('admins') private adminModel: Model<AdminDocument>,
    @InjectModel('blogComments') private blogCommentModel: Model<blogCommentDocument>,
    @InjectModel(BlogRating.name) private blogRatingModel: Model<BlogRatingDocument>,
    @InjectModel(BlogView.name) private blogViewModel: Model<BlogViewDocument>,
    private publicUtils: PublicUtils,
  ) {}
  async getBlogs(query: QueryBlog) {
    const { categories } = query;
    const limit = Number(query.limit) || 20;
    const skip = Number(limit) * Number(query.skip - 1);
    const sort: any = {};
    sort[query.order_by] = query.order_type === 'ASC' ? 1 : -1;

    const categoriesItems = await this.categoryBlogModel.find(
      {
        slug: {
          $in: Array.isArray(categories) ? [...categories] : [categories],
        },
      },
      { _id: 1 },
    );
    const categoriesIds = categoriesItems.map((brand) => new ObjectId(brand._id));
    const items = await this.blogModel
      .find({
        releaseDate: {
          $lte: new Date(),
        },
        status: {
          $in: [statusBlog.PUBLISHED],
        },
        ...(categories && {
          category: {
            $in: [...categoriesIds],
          },
        }),
      })
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .populate('category')
      .populate('admin', 'first_name last_name img_url');
    const count = await this.blogModel
      .find({
        releaseDate: {
          $lte: new Date(),
        },
        status: {
          $in: [statusBlog.PUBLISHED],
        },
      })
      .count();
    return {
      items,
      count,
    };
  }

  async getBlog(slug: string, userId: ObjectId | string, session_id: string) {
    const blog = await this.blogModel.aggregate([
      {
        $match: {
          slug,
          releaseDate: {
            $lte: new Date(),
          },
          status: {
            $in: [statusBlog.PUBLISHED],
          },
        },
      },
      {
        $lookup: {
          from: 'categoriesBlog',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'admins',
          localField: 'admin',
          foreignField: '_id',
          as: 'admin',
        },
      },
      {
        $unwind: {
          path: '$admin',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!blog.length) {
      throw new NotFoundException();
    }
    // console.log(blog);
    blog[0].ratings = await this.getRateBlog(blog[0]._id, new ObjectId(userId));

    blog[0].views = await this.addViewAndGetViewCount(blog[0]._id, session_id, new ObjectId(userId));
    return blog;
  }

  async deleteBlogByAdmin(id: string) {
    const blog = await this.blogModel
      .findOne({ _id: id })
      .populate('category')
      .populate('admin', 'first_name last_name img_url');
    if (!blog) {
      throw new NotFoundException();
    }
    await this.blogModel.deleteOne({ _id: id });
  }

  async createBlogByAdmin(admin: AdminDocument, body: CreateBlogDto) {
    const slug = this.publicUtils.slug(body.title);
    const has_slug_product = await this.blogModel.findOne({ slug });
    if (has_slug_product) {
      throw new BadRequestException('title is exist');
    }
    return await this.blogModel.create({
      ...body,
      admin: new ObjectId(admin._id),
      slug,
    });
  }

  async updateBlogByAdmin(id: string, body: UpdateBlogDto) {
    const blog = await this.blogModel.findOne({ _id: id });
    if (!blog) {
      throw new NotFoundException();
    }
    const slug = await this.publicUtils.slug(body?.title);
    await this.blogModel.updateOne(
      { _id: id },
      {
        ...body,
        slug: slug ? slug : blog.slug,
      },
    );
    return await this.blogModel.findOne({ _id: id });
  }

  async getBlogsByAdmin(query: QueryBlogByAdmin) {
    const { categories = [] } = query;
    const limit = Number(query.limit) || 20;
    const skip = Number(limit) * Number(query.skip - 1);
    const sort: any = {};
    sort[query.order_by] = query.order_type === 'ASC' ? 1 : -1;

    const categoriesItems = await this.categoryBlogModel.find(
      {
        _id: {
          $in: Array.isArray(categories || []) ? [...categories] : [categories],
        },
      },
      { _id: 1 },
    );
    const categoriesIds = categoriesItems.map((brand) => new ObjectId(brand._id));
    const items = await this.blogModel
      .find({
        ...(categories.length && {
          category: {
            $in: [...categoriesIds],
          },
        }),
        ...(query.status !== undefined && {
          status: Number(query.status),
        }),
      })
      .populate('admin', 'first_name last_name img_url')
      .populate('category')
      .limit(limit)
      .skip(skip)
      .sort(sort);
    const count = await this.blogModel.find().count();
    return {
      items,
      count,
    };
  }

  async getBlogByAdmin(id: string) {
    const blog = await this.blogModel.findOne({ _id: id }).populate('category').populate('admin');
    if (!blog) {
      throw new NotFoundException('');
    }
    return blog;
  }

  async ratingBlog(userId: ObjectId | string, body: RatingBlog) {
    const ratingBlog = await this.blogRatingModel.findOne({
      user: new ObjectId(userId),
      blog: new ObjectId(body.blogId),
    });
    if (!ratingBlog) {
      return await this.blogRatingModel.create({
        user: new ObjectId(userId),
        blog: new ObjectId(body.blogId),
        score: body.star,
      });
    }
    await this.blogRatingModel.updateOne(
      { user: new ObjectId(userId), blog: new ObjectId(body.blogId) },
      {
        score: body.star,
      },
    );
  }
  async getRateBlog(blogId: ObjectId, userId?: string | ObjectId) {
    const user = userId ? new ObjectId(userId) : undefined;
    const rating = await this.blogRatingModel.aggregate([
      {
        $match: { blog: new ObjectId(blogId), user },
      },
      {
        $group: {
          _id: null,
          count: { $count: {} },
          score: { $avg: '$score' },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          score: { $round: ['$score', 2] },
        },
      },
    ]);
    console.log(rating);
    if (!rating.length)
      return {
        average: null,
        total: 0,
      };
    const userRate = user ? await this.blogRatingModel.findOne({ blog: new ObjectId(blogId), user }) : undefined;
    return {
      average: rating[0].score,
      total: rating[0].count,
      userRate: userRate?.score,
    };
  }
  async addViewBlog(blogId: ObjectId, sessionId?: string, userId?: string | ObjectId) {
    const user = userId ? new ObjectId(userId) : undefined;
    const view = await this.blogViewModel.findOne({
      $or: [{ product: blogId, sessionId }, ...(user ? [{ blog: blogId, user }] : [])],
    });
    if (view && user && !view.user)
      await this.blogViewModel.updateOne(
        { blog: blogId },
        {
          $set: {
            user,
          },
        },
      );
    if (!view)
      await this.blogViewModel.create({
        blog: blogId,
        user,
        sessionId,
      });
  }
  async getViewCountBlog(blogId: ObjectId) {
    return this.blogViewModel.count({ blog: blogId });
  }
  async addViewAndGetViewCount(productId: ObjectId, sessionId?: string, userId?: string | ObjectId) {
    await this.addViewBlog(productId, sessionId, userId);
    return this.getViewCountBlog(productId);
  }
  async createCommentBlog(userId: string, body: CreateCommentBlogDto) {
    return await this.blogCommentModel.create({
      ...body,
      user: new ObjectId(userId),
      parent: body.parentId ? new ObjectId(body.parentId) : null,
      status: statusBlogComment.PENDING,
    });
  }
  async getCommentsBlog(userId: ObjectId, blogId: string) {
    const items = await this.blogCommentModel.find({
      user: new ObjectId(userId),
      blog: new ObjectId(blogId),
    });
    const count = await this.blogCommentModel
      .find({
        user: new ObjectId(userId),
        blog: new ObjectId(blogId),
      })
      .count();
    return {
      items,
      count,
    };
  }
  async getCommentsBlogByAdmin(query: QueryBlogCommentByAdminDto) {
    let { limit = 20, skip = 1 } = query;
    limit = Number(limit);
    skip = Number(limit) * (Number(skip) - 1);
    const items = await this.blogCommentModel.find().limit(limit).skip(skip);
    const count = await this.blogCommentModel.find().count();
    return {
      items,
      count,
    };
  }
  async getCommentBlogByAdmin(id: string) {
    const commentBlog = await this.blogCommentModel.findOne({
      _id: id,
    });
    if (!commentBlog) {
      throw new NotFoundException();
    }
    return commentBlog;
  }
  async updateCommentBlogByAdmin(id: string, body: UpdateCommentBlogDto) {
    const commentBlog = await this.blogCommentModel.findOne({
      _id: id,
    });
    if (!commentBlog) {
      throw new NotFoundException();
    }
    await this.blogCommentModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
    return await this.blogCommentModel.findOne({ _id: id });
  }
}
