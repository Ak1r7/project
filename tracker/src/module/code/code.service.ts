import { forkJoin, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from 'src/module/user/user.service';
import { Repository } from 'typeorm';
import { FileEntity } from './entity/file.entity';
import { CodeEntity } from './entity/code.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RelationEntity } from './entity/relation.entity';
import { CommentDto } from 'src/core/type/code/comment.dto';

@Injectable()
export class CodeService {
  constructor(
    @InjectRepository(CodeEntity)
    private readonly codeRepository: Repository<CodeEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(RelationEntity)
    private readonly relationRepository: Repository<RelationEntity>,

    private readonly userService: UserService,
  ) {}

  saveCode(
    currentUserId: string,
    file: Express.Multer.File,
  ): Observable<FileEntity> {
    const codeLines = file.buffer.toString('utf8').split('\r\n');
    return from(this.userService.findById(currentUserId)).pipe(
      switchMap((user) => {
        let rowIndex = 1;
        const names = file.originalname;
        const saveOperations = codeLines.map((codeLine) => {
          const newCode = this.codeRepository.create({
            code: codeLine,
            rowColumn: rowIndex,
          });
          rowIndex++;
          return from(this.codeRepository.save(newCode));
        });

        return forkJoin(saveOperations).pipe(
          switchMap((savedCodes) => {
            const contentIds = savedCodes.map((code) => code.id);
            const newRelation = this.relationRepository.create({
              codes: contentIds,
            });
            return from(this.relationRepository.save(newRelation)).pipe(
              switchMap(() => {
                const newFile = this.fileRepository.create({
                  fileName: names,
                  userId: user.id,
                  relation: newRelation,
                });
                return from(this.fileRepository.save(newFile));
              }),
            );
          }),
        );
      }),
    );
  }

  findFileById(id: string): Observable<FileEntity> {
    return from(
      this.fileRepository.findOne({
        where: { id },
      }),
    ).pipe(map((code) => code));
  }

  findById(id: string): Observable<CodeEntity> {
    return from(
      this.codeRepository.findOne({
        where: { id },
      }),
    ).pipe(map((code) => code));
  }

  postComment(
    currentUser: string,
    id: string,
    commentDto: CommentDto,
  ): Observable<CodeEntity> {
    const code = this.findById(id);
    return from(this.userService.findById(currentUser)).pipe(
      switchMap((user) => {
        return from(code).pipe(
          switchMap((code: CodeEntity) => {
            code.comments = commentDto.comment;
            code.userIdComment = user.id;
            return from(this.codeRepository.save(code));
          }),
        );
      }),
    );
  }
}
