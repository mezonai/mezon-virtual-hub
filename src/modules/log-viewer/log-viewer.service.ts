import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class LogViewerService {
    private readonly logDirectory: string;

    constructor() {
        // Default to logs directory in the project root
        // Consider making this configurable via environment variables or service options
        this.logDirectory = process.env.LOG_DIRECTORY || path.join(process.cwd(), 'logs');
    }

    /**
     * Get list of available log files
     */
    // async getLogFiles(): Promise<string[]> {
    //     try {
    //         const files = await fs.readdir(this.logDirectory);
    //         return files.filter(file => file.endsWith('.log'));
    //     } catch (error) {
    //         throw new Error(`Failed to list log files: ${error.message}`);
    //     }
    // }

    // /**
    //  * Get content of a specific log file
    //  */
    // async getLogContent(filename: string, options?: { 
    //     limit?: number;
    //     offset?: number; 
    //     search?: string;
    // }): Promise<{ content: string; totalLines: number }> {
    //     if (!filename || filename.includes('..')) {
    //         throw new Error('Invalid filename');
    //     }

    //     const filePath = path.join(this.logDirectory, filename);
        
    //     try {
    //         const content = await fs.readFile(filePath, 'utf8');
    //         const lines = content.split(os.EOL);
    //         const totalLines = lines.length;
            
    //         let filteredLines = lines;
            
    //         // Apply search if provided
    //         if (options?.search) {
    //             filteredLines = lines.filter(line => 
    //                 line.toLowerCase().includes(options.search.toLowerCase())
    //             );
    //         }
            
    //         // Apply pagination if provided
    //         if (options?.limit) {
    //             const offset = options?.offset || 0;
    //             filteredLines = filteredLines.slice(offset, offset + options.limit);
    //         }
            
    //         return {
    //             content: filteredLines.join(os.EOL),
    //             totalLines
    //         };
    //     } catch (error) {
    //         throw new Error(`Failed to read log file ${filename}: ${error.message}`);
    //     }
    // }

    // /**
    //  * Stream the tail of a log file in real-time
    //  * Returns the last n lines of the log
    //  */
    // async getTailLog(filename: string, lines: number = 100): Promise<string> {
    //     if (!filename || filename.includes('..')) {
    //         throw new Error('Invalid filename');
    //     }

    //     const filePath = path.join(this.logDirectory, filename);
        
    //     try {
    //         const content = await fs.readFile(filePath, 'utf8');
    //         const allLines = content.split(os.EOL);
    //         const tailLines = allLines.slice(-lines).join(os.EOL);
            
    //         return tailLines;
    //     } catch (error) {
    //         throw new Error(`Failed to tail log file ${filename}: ${error.message}`);
    //     }
    // }

    // /**
    //  * Delete a log file
    //  */
    // async deleteLogFile(filename: string): Promise<void> {
    //     if (!filename || filename.includes('..')) {
    //         throw new Error('Invalid filename');
    //     }

    //     const filePath = path.join(this.logDirectory, filename);
        
    //     try {
    //         await fs.unlink(filePath);
    //     } catch (error) {
    //         throw new Error(`Failed to delete log file ${filename}: ${error.message}`);
    //     }
    // }
}