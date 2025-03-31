import { Module } from '@nestjs/common';
import { LogViewerController } from './log-viewer.controller';
import { LogViewerService } from './log-viewer.service';
import { ClsModule } from 'nestjs-cls';

@Module({
    imports: [ClsModule],
    controllers: [LogViewerController],
    providers: [LogViewerService],
    exports: [LogViewerService],
})
export class LogViewerModule {}