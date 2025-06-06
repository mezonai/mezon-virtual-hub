import { Controller, Get, HttpException, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { exec } from 'child_process';

import { existsSync } from 'fs';
import { Public } from '@libs/decorator';
import { AdminBypassGuard } from '@libs/guard/admin.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Log Viewer')
@Controller('log-viewer')
@UseGuards(AdminBypassGuard)
export class LogViewerController {
  @Get('logs')
  getLogs(@Res() res: Response) {
    const logFilePath = '/app/logs/output.log';
    const numberOfLines = 100;

    // ✅ Check if the file exists first
    if (!existsSync(logFilePath)) {
      console.error(`File not found: ${logFilePath}`);
      throw new HttpException('Log file not found', HttpStatus.NOT_FOUND);
    }

    exec(`tail -n ${numberOfLines} ${logFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        throw new HttpException('Error reading log file', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        throw new HttpException('Error reading log file', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      res.send(stdout);
    });
  }
}