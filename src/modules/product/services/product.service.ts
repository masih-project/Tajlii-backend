/* eslint-disable prefer-const */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAuth } from 'src/types/authorization.types';
import { PublicUtils } from 'src/utils/public-utils';
import { BookMark } from '../../bookMark/bookMark.interface';
import { Comment } from '../../comment/comment.interface';
import { CreateProductDto } from '../dto/createProduct.dto';
import { QueryComment } from '../dto/queryComment.dto';
import { QueryProduct } from '../dto/queryProduct.dto';
import { QueryProductByAdmin } from '../dto/queryProductByAdmin.dto';
import { RatingProduct } from '../dto/ratingProduct.dto';
import { UpdateProductByAdmin } from '../dto/updateProduct.dto';
import { statusComment, statusProduct } from '@$/types/status.types';
import { Product } from '../schemas/product.schema';
import { ProductViewService } from './product-view.service';
import { ProductRatingService } from './product-rating.service';
import { Setting } from '@$/modules/settings/setting.schema';
import { BrandDocument } from '@$/modules/brand/brand.schema';
import { CategoryDocument } from '@$/modules/category/category.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('products') private productModel: Model<Product>,
    @InjectModel('comments') private commentModel: Model<Comment>,
    @InjectModel('bookMarks') private bookmarkModel: Model<BookMark>,
    @InjectModel('settings') private settingModel: Model<Setting>,
    @InjectModel('brands') private brandModel: Model<BrandDocument>,
    @InjectModel('categories') private categoryModel: Model<CategoryDocument>,
    private readonly viewService: ProductViewService,
    private readonly ratingService: ProductRatingService,
    private readonly publicUtils: PublicUtils,
  ) {}
  async createProductByAdmin(input: CreateProductDto): Promise<any> {
    const slug = this.publicUtils.slug(input.title_fa);
    const has_slug_product = await this.productModel.findOne({ slug });
    if (has_slug_product) {
      throw new BadRequestException('اسم فارسی محصول قبلا ثبت شده است');
    }
    const product_code = this.publicUtils.generateRandomNumber(6);
    const price_discount = (Number(input.selling_price) * input.discount) / 100;
    const price_after_discount = input.selling_price - price_discount;
    const newProduct = await this.productModel.create({
      ...input,
      slug,
      price_after_discount,
      product_code,
    });
    return newProduct;
  }
  async getProductsByAdmin(query: QueryProductByAdmin): Promise<any> {
    let {
      limit = 20,
      skip = 1,
      title_fa = '',
      title_en = '',
      description = '',
      slug = '',
      product_id = '',
      product_code = '',
      brands = [],
      categories = [],
      status = [],
    } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const sort = {};
    sort[query.order_by] = query.order_type === 'ASC' ? 1 : -1;
    let items;
    const brandsItems = Array.isArray(brands) ? [...brands] : [brands];
    const categoriesItems = Array.isArray(categories) ? [...categories] : [categories];
    const statusItems = Array.isArray(status) ? [...status] : [status];
    const matchFilter = {
      ...((query.minDiscount || query.maxDiscount) && {
        discount: {
          ...(query.minDiscount && { $gte: query.minDiscount }),
          ...(query.maxDiscount && { $lte: query.maxDiscount }),
        },
      }),
      ...((query.minSellingPrice || query.maxSellingPrice) && {
        selling_price: {
          ...(query.minSellingPrice && { $gte: query.minSellingPrice }),
          ...(query.maxSellingPrice && { $lte: query.maxSellingPrice }),
        },
      }),
      ...((query.minPriceAfterDiscount || query.maxPriceAfterDiscount) && {
        price_after_discount: {
          ...(query.minPriceAfterDiscount && { $gte: query.minPriceAfterDiscount }),
          ...(query.maxPriceAfterDiscount && { $lte: query.maxPriceAfterDiscount }),
        },
      }),
      ...((query.minCountSales || query.maxCountSales) && {
        count_sales: {
          ...(query.minCountSales && { $gte: query.minCountSales }),
          ...(query.maxCountSales && { $lte: query.maxCountSales }),
        },
      }),
      ...((query.minScore || query.maxScore) && {
        score: {
          ...(query.minScore && { $gte: query.minScore }),
          ...(query.maxScore && { $lte: query.maxScore }),
        },
      }),
      ...((query.minWidth || query.maxWidth) && {
        width: {
          ...(query.minWidth && { $gte: query.minWidth }),
          ...(query.maxWeight && { $lte: query.maxWeight }),
        },
      }),
      ...((query.minHeight || query.maxHeight) && {
        height: {
          ...(query.minHeight && { $gte: query.minHeight }),
          ...(query.maxHeight && { $lte: query.maxWeight }),
        },
      }),
      ...((query.minWeight || query.maxWeight) && {
        weight: {
          ...(query.minWeight && { $gte: query.minWeight }),
          ...(query.maxWeight && { $lte: query.maxWeight }),
        },
      }),
      ...((query.dateFrom || query.dateTo) && {
        createdAt: {
          ...(query.dateFrom && { $gte: query.dateFrom }),
          ...(query.dateTo && { $lte: query.dateTo }),
        },
      }),
      ...(brandsItems.length && {
        brands: {
          $in: [...brandsItems],
        },
      }),
      ...(categoriesItems.length && {
        categories: {
          $in: [...categoriesItems],
        },
      }),
      ...(status.length && {
        status: {
          $in: [...statusItems],
        },
      }),
    };
    items = await this.productModel
      .find({
        ...matchFilter,
        $and: [
          { title_fa: { $regex: new RegExp(title_fa as string), $options: 'i' } },
          { title_en: { $regex: new RegExp(title_en as string), $options: 'i' } },
          { description: { $regex: new RegExp(description as string), $options: 'i' } },
          { product_id: { $regex: new RegExp(product_id as string), $options: 'i' } },
          { product_code: { $regex: new RegExp(product_code as string), $options: 'i' } },
          { slug: { $regex: new RegExp(slug as string), $options: 'i' } },
        ],
      })
      .populate('category')
      .populate('depot')
      .populate('subCategory')
      .populate('brand')
      .sort(sort)
      .limit(limit)
      .skip(skip);
    const count = await this.productModel
      .find({
        ...matchFilter,
        $and: [
          { title_fa: { $regex: new RegExp(title_fa as string), $options: 'i' } },
          { title_en: { $regex: new RegExp(title_en as string), $options: 'i' } },
          { description: { $regex: new RegExp(description as string), $options: 'i' } },
          { product_id: { $regex: new RegExp(product_id as string), $options: 'i' } },
          { product_code: { $regex: new RegExp(product_code as string), $options: 'i' } },
          { slug: { $regex: new RegExp(slug as string), $options: 'i' } },
        ],
      })
      .count();
    return {
      items,
      count,
    };
  }
  async getProductByAdmin(id: string): Promise<any> {
    const product = await this.productModel.findOne({ _id: id });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    return product;
  }
  async updateProductByAdmin(id: string, input: UpdateProductByAdmin): Promise<any> {
    const product = await this.productModel.findOne({ _id: id });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    let data: any = {
      ...input,
    };
    if (input.title_fa) {
      const slug = this.publicUtils.slug(input.title_fa);
      const has_slug_product = await this.productModel.findOne({ slug });
      if (has_slug_product) {
        throw new BadRequestException('اسم فارسی محصول قبلا ثبت شده است');
      }
      data = {
        ...data,
        slug,
      };
    }
    if (input.discount || input.selling_price || input.discount === 0) {
      const selling_price = input?.selling_price ? input?.selling_price : product.selling_price;
      const discount = input.discount !== undefined ? input.discount : product.discount;
      const price_discount = (Number(selling_price) * Number(discount)) / 100;
      const price_after_discount = Number(selling_price) - Number(price_discount);
      data = {
        ...data,
        price_after_discount: Math.round(price_after_discount),
      };
    }
    const result = await this.productModel.findOneAndUpdate(
      { _id: id },
      {
        ...data,
      },
    );
    return result;
  }
  async deleteProductByAdmin(id: string): Promise<any> {
    const product = await this.productModel.findOne({ _id: id });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const result = await this.productModel.deleteOne({ _id: id });
    return result;
  }
  async getCommentsByProduct(id: string, query: QueryComment): Promise<any> {
    let { limit = 20, skip = 1, keyword = '' } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const product = await this.productModel.findOne({ _id: id });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const items = await this.commentModel
      .find(
        {
          product: id,
          parent: undefined,
          status:statusComment.CONFIRMED
        },
        { product: 0, status: 0 },
      )
      .populate({
        path: 'answers',
        select: 'comment createdAt updatedAt',
        populate: [
          {
            path: 'user',
            select: 'first_name last_name',
          },
          {
            path: 'answers',
            select: 'comment createdAt updatedAt',
            populate: [
              {
                path: 'user',
                select: 'first_name last_name',
              },
              {
                path: 'answers',
                select: 'comment createdAt updatedAt',
                populate: [
                  {
                    path: 'user',
                    select: 'first_name last_name',
                  },
                  {
                    path: 'answers',
                    select: 'comment createdAt updatedAt',
                    populate: {
                      path: 'user',
                      select: 'first_name last_name',
                    },
                  },
                ],
              },
            ],
          },
        ],
      })
      .populate('user', 'first_name last_name');
    const count = await this.commentModel
      .find({
        product: id,
        parent: undefined,
        $or: [
          {
            comment: {
              $regex: new RegExp(keyword as string),
              $options: 'i',
            },
          },
        ],
      })
      .count();
    return {
      count,
      items,
    };
  }

  async getRecommendProducts(id: string): Promise<any> {
    const product = await this.productModel.findOne({ _id: id, status: statusProduct.CONFIRMED });
    if (!product) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    const items = await this.productModel.aggregate([
      {
        $match: {
          status: statusProduct.CONFIRMED,
        },
      },
      {
        $sample: {
          size: 6,
        },
      },
    ]);
    return {
      items,
    };
  }

  async getStatusProduct(id: string, user: UserAuth): Promise<any> {
    const bookMark = await this.bookmarkModel.findOne({
      user: user._id,
      product: id,
    });
    return {
      is_bookMark: !!bookMark,
    };
  }

  async getProducts(query: QueryProduct, session_id: string, user: UserAuth): Promise<any> {
    let {
      limit = 20,
      skip = 1,
      min_price = 0,
      max_price = 9000000,
      order_by,
      order_type,
      brands,
      keyword,
      categories,
    } = query;
    limit = Number(limit);
    skip = Number(limit) * Number(skip - 1);
    const sort = {};
    sort[order_by] = order_type === 'ASC' ? 1 : -1;
    const setting = await this.settingModel.findOne({});
    let tax = 0;
    if (setting.tax_percent) {
      tax = setting.tax_percent;
    }
    let matchFilter: any = {
      release_date: {
        $lte: new Date(),
      },
      price_after_discount: {
        $lte: max_price,
        $gte: min_price,
      },
    };
    let lookupFilter: any = {
      from: 'carts',
      let: {
        product_id: '$_id',
      },
      as: 'carts',
    };
    if (user) {
      lookupFilter = {
        ...lookupFilter,
        let: {
          user_id: user._id,
          product_id: '$_id',
        },
        pipeline: [
          {
            $addFields: {
              user_id: {
                $convert: {
                  input: '$user_id',
                  to: 'objectId',
                  onError: 0,
                },
              },
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$user', '$$user_id'],
                  },
                ],
              },
            },
          },
          {
            $unwind: '$items',
          },
          {
            $match: {
              $expr: {
                $eq: ['$items.product', '$$product_id'],
              },
            },
          },
          {
            $group: {
              _id: '$_id',
              count: { $sum: '$items.count' },
            },
          },
        ],
        as: 'carts',
      };
    } else {
      lookupFilter = {
        ...lookupFilter,
        from: 'carts',
        let: {
          product_id: '$_id',
          session_id: session_id,
        },
        pipeline: [
          {
            $addFields: {
              product: {
                $toObjectId: '$product',
              },
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$product', '$$product_id'],
                  },
                  {
                    $eq: ['$session_id', '$$session_id'],
                  },
                ],
              },
            },
          },
          {
            $project: {
              product: 0,
              user: 0,
              createdAt: 0,
              updatedAt: 0,
              _id: 0,
              session_id: 0,
            },
          },
          {
            $addFields: {
              carts: {
                $filter: {
                  input: '$carts',
                  as: 'cart',
                  cond: {
                    $eq: ['$$cart.product', '$$product_id'],
                  },
                },
              },
            },
          },
        ],
        as: 'carts',
      };
    }
    if (brands) {
      const brandsItems = await this.brandModel.find(
        {
          slug: {
            $in: Array.isArray(brands) ? [...brands] : [brands],
          },
        },
        { _id: 1 },
      );
      const brandsIds = brandsItems.map((brand) => String(brand._id));
      matchFilter = {
        ...matchFilter,
        brand: {
          $in: [...brandsIds],
        },
      };
    }
    if (keyword) {
      matchFilter = {
        ...matchFilter,
        $text: {
          $search: keyword,
        },
      };
    }
    if (categories) {
      const categoriesItems = await this.categoryModel.find(
        {
          slug: {
            $in: Array.isArray(categories) ? [...categories] : [categories],
          },
        },
        { _id: 1 },
      );
      const categoriesIds = categoriesItems.map((category) => String(category._id));
      console.log(categoriesIds);
      matchFilter = {
        ...matchFilter,
        category: {
          $in: [...categoriesIds],
        },
      };
    }
    const items = await this.productModel.aggregate([
      {
        $match: {
          ...matchFilter,
          status: {
            $in: [statusProduct.CONFIRMED],
          },
        },
      },
      {
        $lookup: {
          ...lookupFilter,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'productratings',
          localField: '_id',
          foreignField: 'product',
          as: 'productratings',
        },
      },
      {
        $addFields: {
          cart: {
            $first: '$carts',
          },
          tax: {
            $multiply: ['$selling_price', tax / 100],
          },
          ratings: {
            average: { $avg: '$productratings.score' },
            total: { $size: '$productratings' },
          },
        },
      },
      {
        $addFields: {
          final_price: {
            $sum: ['$tax', '$price_after_discount'],
          },
        },
      },
      {
        $addFields: {
          tax: {
            $round: ['$tax', 0],
          },
          final_price: {
            $round: ['$final_price', 0],
          },
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          carts: 0,
          depot: 0,
          brand: 0,
          productratings: 0,
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    const count: any = await this.productModel
      .find({
        ...matchFilter,
      })
      .count();
    return {
      items,
      count,
    };
  }

  async getProduct(slug: string, session_id: string, user?: { _id: string }) {
    let lookupCartFilter: any = {
      from: 'carts',
      let: {
        product_id: '$_id',
      },
      as: 'carts',
    };
    const setting = await this.settingModel.findOne({});
    let tax = 0;
    if (setting.tax_percent) {
      tax = setting.tax_percent;
    }
    // if (user && typeof user === 'object') {
    //   lookupCartFilter = {
    //     ...lookupCartFilter,
    //     from: 'carts',
    //     let: {
    //       product_id: '$_id',
    //       user_id: user._id,
    //     },
    //     pipeline: [
    //       {
    //         $addFields: {
    //           product: {
    //             $toObjectId: '$product',
    //           },
    //           user_id: {
    //             $toObjectId: '$user',
    //           },
    //         },
    //       },
    //       {
    //         $match: {
    //           $expr: {
    //             $and: [
    //               {
    //                 $eq: ['$product', '$$product_id'],
    //               },
    //               {
    //                 $eq: ['$user', '$$user_id'],
    //               },
    //             ],
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           product: 0,
    //           user: 0,
    //           createdAt: 0,
    //           updatedAt: 0,
    //           _id: 0,
    //           session_id: 0,
    //         },
    //       },
    //     ],
    //     as: 'carts',
    //   };
    // } else {
    lookupCartFilter = {
      ...lookupCartFilter,
      from: 'carts',
      let: {
        product_id: '$_id',
        session_id: session_id,
      },
      pipeline: [
        {
          $addFields: {
            product: {
              $toObjectId: '$product',
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$product', '$$product_id'],
                },
                {
                  $eq: ['$session_id', '$$session_id'],
                },
              ],
            },
          },
        },
        {
          $project: {
            product: 0,
            user: 0,
            createdAt: 0,
            updatedAt: 0,
            _id: 0,
            session_id: 0,
          },
        },
      ],
      as: 'carts',
    };

    const product = await this.productModel.aggregate([
      {
        $match: {
          slug,
          status: {
            $in: [statusProduct.CONFIRMED],
          },
        },
      },
      {
        $addFields: {
          brand: {
            $toObjectId: '$brand',
          },
          category: {
            $toObjectId: '$category',
          },
        },
      },
      {
        $lookup: {
          localField: 'brand',
          foreignField: '_id',
          from: 'brands',
          as: 'brands',
        },
      },
      {
        $lookup: {
          from: 'ashantions',
          as: 'ashantion',
          let: {
            product_id: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$product', '$$product_id'],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          localField: 'category',
          foreignField: '_id',
          from: 'categories',
          as: 'categories',
        },
      },
      {
        $lookup: {
          ...lookupCartFilter,
        },
      },
      {
        $addFields: {
          brand: {
            $first: '$brands',
          },
          category: {
            $first: '$categories',
          },
          cart: {
            $first: '$carts',
          },
          tax: {
            $multiply: ['$selling_price', tax / 100],
          },
        },
      },
      {
        $addFields: {
          final_price: {
            $sum: ['$tax', '$price_after_discount'],
          },
        },
      },
      {
        $addFields: {
          final_price: {
            $round: ['$final_price', 0],
          },
          tax: {
            $round: ['$tax', 0],
          },
        },
      },
      {
        $project: {
          categories: 0,
          brands: 0,
          carts: 0,
          inventory: 0,
          release_date: 0,
        },
      },
    ]);
    if (!product.length) {
      throw new NotFoundException('آیتمی یافت نشد');
    }
    product[0].views = await this.viewService.addViewAndGetViewCount(product[0]._id, session_id, user?._id);
    product[0].ratings = await this.ratingService.getRates(product[0]._id, user?._id);
    return product[0];
  }

  async rateProduct(body: RatingProduct, user: UserAuth) {
    const product = await this.productModel.findOne({
      _id: body.product_id,
    });
    if (!product) throw new NotFoundException('آیتمی یافت نشد');
    return this.ratingService.rateProduct(product._id, user._id, body.star);
  }
  async genrateExcelProducts() {
    return await this.productModel.find().populate('brand').populate('category');
  }
}
