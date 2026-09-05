import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request as ExpressRequest, Response } from 'express';

type AuthenticatedRequest = ExpressRequest & {
  user: {
    id: string;
  };
};

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  getMonthlyReport(
    @Request() req: AuthenticatedRequest,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.reportsService.getMonthlyReportData(req.user.id, m, y);
  }

  @Get('export/csv')
  async exportCsv(
    @Request() req: AuthenticatedRequest,
    @Query('month') month: string,
    @Query('year') year: string,
    @Res()
    res: Response,
  ) {
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();

    const csvData = await this.reportsService.generateCsvReport(
      req.user.id,
      m,
      y,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=financehub-report-${m}-${y}.csv`,
    );
    return res.status(200).send(csvData);
  }

  @Get('export/pdf')
  async exportPdf(
    @Request() req: AuthenticatedRequest,
    @Query('month') month: string,
    @Query('year') year: string,
    @Res() res: Response,
  ) {
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();

    const pdfBuffer = await this.reportsService.generatePdfReport(
      req.user.id,
      m,
      y,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=financehub-report-${m}-${y}.pdf`,
    );
    return res.status(200).send(pdfBuffer);
  }
}