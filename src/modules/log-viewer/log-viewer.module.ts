import { Module } from '@nestjs/common';
import { LogViewerController } from './log-viewer.controller';
import { LogViewerService } from './log-viewer.service';

@Module({
    imports: [],
    controllers: [LogViewerController],
    providers: [LogViewerService],
    exports: [LogViewerService],
})
export class LogViewerModule {}