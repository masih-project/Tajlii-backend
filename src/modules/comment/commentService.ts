import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AdminAuth, UserAuth } from 'src/types/authorization.types';
import { statusComment, statusUser } from 'src/types/status.types';
import { Product } from '../product/schemas/product.schema';
import { CreateCommentDto } from './dto/createComment';
import { QueryCommentByAdmin } from './dto/queryCommentByAdmin';
import { UpdateCommentDto } from './dto/updateComment';
import { ObjectId } from 'mongodb';
import { CreateCommentByAdminDto } from './dto/create-comment-admin.dto';
import { AdminDocument } from '../admin/schemas/admin.schema';
import { CommentDocument } from './comment.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('comments') private commentModel: Model<CommentDocument>,
    @InjectModel('products') private productModel: Model<Product>,
  ) {}
  async createCommentByProduct(body: CreateCommentDto, user: UserAuth): Promise<any> {
    const product = await this.productModel.findOne({
      _id: body.product_id,
    });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.commentModel.create({
      comment: body.comment,
      user: new ObjectId(user._id),
      product: body.product_id,
      parent: body.parent ? new mongoose.Types.ObjectId(body.parent) : null,
      status: statusComment.PENDING,
    });
  }
  async getCommentsByAdmin(query: QueryCommentByAdmin): Promise<any> {
    let { limit = 10, skip = 1, order_by, order_type } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(Number(skip) - 1);
    let sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const items = await this.commentModel
      .find()
      .populate({
        path: 'user',
        model: 'users',
        select: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          mobile: 1,
          username: 1,
          email: 1,
          status: 1,
          role: 1,
        },
      })
      .populate('product')
      .limit(limit)
      .skip(skip);
    const count = await this.commentModel.find().count();

    return {
      count,
      items,
    };
  }
  async deleteCommentByAdmin(id: string, admin: AdminAuth): Promise<any> {
    const comment = await this.commentModel.findOne({ _id: id });
    if (!comment) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    await this.commentModel.deleteOne({ _id: id });
  }
  async getCommentByAdmin(id: string): Promise<any> {
    const comment = await this.commentModel
      .findOne({ _id: id })
      .populate({
        path: 'user',
        model: 'users',
        select: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          mobile: 1,
          username: 1,
          email: 1,
          status: 1,
          role: 1,
        },
      })
      .populate('product')
      .populate({
        path: 'answers',
        populate: {
          path: 'user',
        },
      });
    if (!comment) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return comment;
  }
  async getComments(user: UserAuth): Promise<any> {
    const comments = await this.commentModel.find({ user: user._id }).populate('user', `first_name last_name username`);
    return comments;
  }
  async updateCommentByAdmin(id: string, body: UpdateCommentDto): Promise<any> {
    const comment = await this.commentModel.findOne({ _id: id });
    if (!comment) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return this.commentModel.updateOne(
      { _id: id },
      {
        ...body,
      },
    );
  }
  async createCommentByAdmin(id: string, body: CreateCommentByAdminDto, admin: AdminDocument) {
    const comment = await this.commentModel.findOne({ _id: id });
    if (!comment) {
      throw new NotFoundException
    }
    return await this.commentModel.create({
      comment: body.comment,
      product: new ObjectId(comment.product),
      parent: new ObjectId(id),
      admin: new ObjectId(admin._id),
      status: statusComment.CONFIRMED
    })
  }
}
