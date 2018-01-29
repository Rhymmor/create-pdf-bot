import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import { logger } from '../logger';

export class TmpDirsWatcher {
    private activeIds: Set<string>;
    private static TMP_DIR = '/tmp/create-pdf-bot';

    constructor() {
        this.activeIds = new Set();
    }

    private isDir(dir: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.lstat(dir, (err, stats) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return resolve(false);
                    }
                    logger.error(err);
                    return reject(err);
                }
                return resolve(stats.isDirectory());
            });
        });
    }
    
    private tryCreateDir(dir: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (await this.isDir(dir)) { return resolve(); }
    
            fs.mkdir(dir, err => {
                if (err) { 
                    logger.error(err);
                    return reject(err); 
                }
                resolve();
            });
        });
    }

    private tryRemoveDir(dir: string) {
        return new Promise<void>(async (resolve, reject) => {
            rimraf(dir, err => {
                if (err) { 
                    logger.error(err);
                    return reject(err); 
                }
                resolve();
            })
        })
    }

    getIdTmpDir = (id: string) => {
        return path.join(TmpDirsWatcher.TMP_DIR, id);
    }

    public prepareIdDir = async (id: string) => {
        logger.warn(`Creating directory for id ${id}`);
        await this.tryCreateDir(TmpDirsWatcher.TMP_DIR);
        const tmpDir = this.getIdTmpDir(id);
        await this.tryCreateDir(tmpDir);
        this.activeIds.add(id);
        return tmpDir;
    }

    public clean = async (id: string) => {
        try {
            logger.warn(`Deleting directory for id ${id}`);
            const tmpDir = this.getIdTmpDir(id);
            await this.tryRemoveDir(tmpDir);
            this.activeIds.delete(id);
            logger.warn(`Deleted ${tmpDir} directory`);
            return true;
        } catch (e) {
            logger.error(e);
            return false;
        }
    }

    public isIdActive = (id: string) => {
        return this.activeIds.has(id);
    }

    public cleanAll = async () => {
        logger.warn(`Deleting directory ${TmpDirsWatcher.TMP_DIR}`);
        await this.tryRemoveDir(TmpDirsWatcher.TMP_DIR);
        logger.warn(`Deleted ${TmpDirsWatcher.TMP_DIR} directory`);
    }
}