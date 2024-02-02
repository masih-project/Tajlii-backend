import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import * as excel from 'exceljs';
import { Response } from 'express';

interface SheetType<T> {
  name?: string;
  data: T[];
  columns: { names: (keyof T | string)[]; titles?: string[]; widths?: number[] };
}
export interface DownloadExcelData<T> {
  filename: string;
  sheets: SheetType<T>[];
}

@Injectable()
export class DownloadExcelInterceptor implements NestInterceptor {
  // constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const res: Response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: DownloadExcelData<any>) => {
        const workbook = new excel.Workbook();
        for (let i = 0; i < data.sheets.length; i++) {
          const worksheet = workbook.addWorksheet(data.sheets[i].name ?? `Sheet${i + 1}`);
          const cols = data.sheets[i].columns;
          worksheet.columns = cols.names.map((col, idx) => ({
            key: col.toString(),
            header: cols.titles ? cols.titles[idx] : col.toString(),
            width: cols.widths ? cols.widths[idx] : 18,
          }));
          worksheet.addRows(data.sheets[i].data);
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + data.filename + '.xlsx');
        return workbook.xlsx.write(res).then(() => {
          res.status(200).end();
        });
        // return parse(sheets, { fields: sheets.length ? Object.keys(sheets[0]) : ['empty'] });
      }),
    );
  }
}

// tap((res) =>
// (async () => {
// })()
//   .then(() => {
//     //
//   })
//   .catch((err) => console.err(err)),
// ),
