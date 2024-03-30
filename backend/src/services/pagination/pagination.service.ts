import { Injectable } from '@nestjs/common';
import { ResPagination } from './dto/res-pagination';

@Injectable()
export class PaginationService {
  pagination<T>(findAndCount: [T[], number], take: number): ResPagination<T> {
    const array = findAndCount[0];
    const totalPages =
      Math.floor((findAndCount[1] && findAndCount[1] - 1) / take) + 1;

    return { array, totalPages };
  }
}
