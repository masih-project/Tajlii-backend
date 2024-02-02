import { RewardType } from '@$/types/public.types';
import * as moment from 'moment';
import { statusOrder, statusProduct } from 'src/types/status.types';
export class PublicUtils {
  statusOrdersItems = [
    {
      title: 'لغو شده',
      status: statusOrder.CANCELED,
    },
    {
      title: 'تایید شده',
      status: statusOrder.CONFIRMED,
    },
    {
      title: 'حذف شده',
      status: statusOrder.DELETED,
    },
    {
      title: 'مرجوعی',
      status: statusOrder.RETURNED,
    },
    {
      title: 'درانتظار تایید',
      status: statusOrder.WAITING_CONFIRMED,
    },
    {
      title: 'درانتظار تکمیل اطلاعات',
      status: statusOrder.WAITING_COMPLETION_INFORMATION,
    },
    {
      title: 'در انتظار پرداخت',
      status: statusOrder.WAITING_PAYMENT,
    },
  ];

  deliveryMethodItems = [
    {
      title: 'حضوری',
      status: 0,
    },
    {
      title: 'پست',
      status: 1,
    },
  ];

  typesRewardItems = [
    {
      title: 'شخصی',
      status: RewardType.PERSONAL,
    },
    {
      title: 'معرف',
      status: RewardType.IDENTIFICATION,
    },
    {
      title: 'چندسطحی',
      status: RewardType.MULTILEVEL,
    },
    {
      title: 'نسل',
      status: RewardType.GENERATION,
    },
  ];
  statusProductItems = [
    {
      title: 'فعال',
      status: statusProduct.CONFIRMED,
    },
    {
      title: 'غیرفعال',
      status: statusProduct.CANCELED,
    },
  ];
  slug(str: string) {
    if (!str) {
      return '';
    }
    let titleStr = str.replace(/^\s+|\s+$/g, '');
    titleStr = titleStr.toLowerCase();
    //persian support
    titleStr = titleStr
      .replace(/[^a-z0-9_\s-ءاأإآؤئبتثجحخدذرزسشصضطظعغفقكلمنهويةى]#u/, '')
      // Collapse whitespace and replace by -
      .replace(/\s+/g, '-')
      // Collapse dashes
      .replace(/-+/g, '-');
    titleStr = titleStr;
    return titleStr;
  }
  genrate_code_order() {
    return Math.random().toString(36).slice(-6);
  }
  generate_code_transaction() {
    return Math.random().toString(36).slice(-6);
  }
  generate_code_product() {
    return Math.random().toString(36).slice(-6);
  }
  generate_code_ticket() {
    return Math.random().toString(36).slice(-6);
  }
  async getDateToday() {
    const date = moment().format();
    return moment(date).toDate();
    // return moment().format()
  }
  generateRandomNumber(num: number) {
    return Math.floor(Math.random() * (9 * Math.pow(10, num - 1))) + Math.pow(10, num - 1);
  }
  findNested(arr: any[], id: string) {
    const found = arr.find((node) => String(node._id) == String(id));
    if (found) {
      return true;
    }
    return arr.some((c) => this.findNested(c.subs || [], id));
  }
  // async flat(array) {
  //     var result = [];
  //     array.forEach((a) => {
  //         result.push(a);
  //         if (Array.isArray(a.parents)) {
  //             result = result.concat(this.flat(a.parents));
  //             delete a.parents
  //         }
  //     })
  //     return result;
  // }
  // async flatten(arr, mainParent = null) {
  //     if (!arr) return;

  //     let result = [];
  //     for (const obj of arr) {
  //         //@ts-ignore
  //         result.push(...(flatten(obj.children, mainParent ?? obj.name) ?? [{ ...obj, mainParent }]));
  //     }

  //     return result;
  // }
  flat(xs, name = null) {
    xs.flatMap((x) => (x.parents ? this.flat(x.parents, name || x.first_name) : [{ ...x, mainParent: name }]));
  }

  flatten(arr) {
    return [].concat(
      ...arr.map(function (obj) {
        return [].concat.apply([{ _id: obj._id }], this.flatten(obj.parents));
      }),
    );
  }

  convertArr = (arr) => {
    return arr.reduce((init, cur) => {
      const plain = init.concat(cur);
      const parents = cur.parents;
      return plain.concat(parents && parents.length ? this.convertArr(parents) : []);
    }, []);
  };
  generateArr = (arr) => {
    return this.convertArr(arr).map((v) => ({
      _id: v._id,
    }));
  };
  convertMutilLevelArr = (arr) => {
    return arr.reduce((init, cur) => {
      const plain = init.concat(cur);
      const subs = cur.subs;
      return plain.concat(subs && subs.length ? this.convertMutilLevelArr(subs) : []);
    }, []);
  };
  generateMultiLevelArr = (arr) => {
    return this.convertMutilLevelArr(arr).map((v) => ({
      _id: v._id,
      username: v.username,
      network: v.network,
      level: v.level,
    }));
  };

  convertGenerationArr = (arr) => {
    return arr.reduce((init, cur) => {
      const plain = init.concat(cur);
      const subs = cur.subs;
      return plain.concat(subs && subs.length ? this.convertGenerationArr(subs) : []);
    }, []);
  };

  generateGenerationArr = (arr) => {
    return this.convertGenerationArr(arr).map((v) => ({
      _id: v._id,
      username: v.username,
      network: v.network,
      rank: v.rank,
    }));
  };

  findClosestAge = (agesArray, targetAge) => {
    let closestAge = null;
    let smallestDiff = Infinity;

    for (let i = 0; i < agesArray.length; i++) {
      const currentAge = agesArray[i].rank.number_rank;
      const diff = Math.abs(currentAge - targetAge);

      if (diff < smallestDiff) {
        closestAge = agesArray[i];
        smallestDiff = diff;
      }
    }

    return closestAge;
  };

  convertDateMiladiToShamsi(date: string) {
    const convertDate: any = new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const time =
      `${new Date(date).getHours()}` +
      ':' +
      `${new Date(date).getMinutes() < 10 ? '0' : ''}` +
      `${new Date(date).getMinutes()}`;
    return `${time} ${convertDate}`;
  }
  getLabelStatusOrder(status: number) {
    const item = this.statusOrdersItems.find((order) => order.status === status);
    return item.title;
  }

  getLabelStatusProduct(status: number) {
    const item = this.statusProductItems.find((product) => product.status === status);
    return item.title;
  }

  getLabelDeliveryMethod(status: number) {
    const item = this.deliveryMethodItems.find((item) => item.status === status);
    return item.title;
  }
  getLabelReward(status: number) {
    const item = this.typesRewardItems.find((item) => item.status === status);
    return item.title;
  }
  getNameMonthShamsi(date: string) {
    const convertDate: any = new Date(date).toLocaleDateString('fa-IR', { month: 'long' });
    return `${convertDate} ماه`;
  }
  generateFakeEmail() {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    const domain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    let username = '';

    // ایجاد نام کاربری تصادفی
    for (let i = 0; i < 7; i++) {
      username += chars[Math.floor(Math.random() * chars.length)];
    }

    // انتخاب دامنه تصادفی
    const randomDomainIndex = Math.floor(Math.random() * domain.length);
    const randomDomain = domain[randomDomainIndex];

    // ایجاد ایمیل جعلی
    const fakeEmail = username + '@' + randomDomain;

    return fakeEmail;
  }
  generateFakeUsername() {
    const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let username = '';

    // ایجاد نام کاربری تصادفی
    for (let i = 0; i < 7; i++) {
      username += chars[Math.floor(Math.random() * chars.length)];
    }

    return username;
  }

  generateFakePhoneNumber() {
    const prefix = '09';
    let phoneNumber = prefix;

    // ایجاد ارقام تصادفی دیگر برای شماره موبایل
    for (let i = 0; i < 9; i++) {
      phoneNumber += Math.floor(Math.random() * 10);
    }

    return phoneNumber;
  }
  generateFakeNationalCode() {
    let nationalCode = '';

    // ایجاد تعداد رقم تصادفی برای کد ملی
    for (let i = 0; i < 10; i++) {
      nationalCode += Math.floor(Math.random() * 10);
    }

    return nationalCode;
  }
}
