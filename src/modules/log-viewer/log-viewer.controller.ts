import { Controller, Get, HttpException, HttpStatus, Res } from '@nestjs/common';
import { exec } from 'child_process';
import { Response } from 'express';

import { RequireAdmin } from '@libs/decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { existsSync } from 'fs';

@ApiBearerAuth()
@ApiTags('Log Viewer')
@Controller('log-viewer')
@RequireAdmin()
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