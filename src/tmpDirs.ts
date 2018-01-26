import * as fs from 'fs';
import * as path from 'path';
import { deleteItem } from './utils';
import * as rimraf from 'rimraf';

export class TmpDirsWatcher {
    private activeIds: string[];
    private static TMP_DIR = '/tmp/create-pdf-bot';

    constructor() {
        this.activeIds = [];
    }

    private isDir(dir: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.lstat(dir, (err, stats) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return resolve(false);
                    }
                    console.error(err);
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
                    console.error(err);
                    return reject(err); 
                }
                resolve();
            });
        });
    }

    private tryRemoveDir(dir: string) {
        return new Promise<void>(async (resolve, reject) => {
            rimraf(dir, err => {
                if (err) { return reject(err); }
                resolve();
            })
        })
    }

    private getIdTmpDir(id: string) {
        return path.join(TmpDirsWatcher.TMP_DIR, id);
    }

    prepareIdDir = async (id: string) => {
        console.log(`Creating directory for id ${id}`);
        await this.tryCreateDir(TmpDirsWatcher.TMP_DIR);
        const tmpDir = this.getIdTmpDir(id);
        await this.tryCreateDir(tmpDir);
        this.activeIds.push(id);

        console.log(`Created ${tmpDir} directory`);
        return tmpDir;
    }



    clean = async (id: string) => {
        try {
            console.log(`Deleting directory for id ${id}`);
            const tmpDir = this.getIdTmpDir(id);
            await this.tryRemoveDir(tmpDir);
            deleteItem(this.activeIds, id);

            console.log(`Deleted ${tmpDir} directory`);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}