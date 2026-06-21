import { ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../../common/types/authenticated-user';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { StudentRepository } from './student.repository';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let repo: jest.Mocked<
    Pick<StudentRepository, 'findStudentTenant' | 'listScores' | 'listComments'>
  >;
  let prisma: {
    user: { findFirst: jest.Mock };
    classAssistant: { findFirst: jest.Mock };
  };
  let service: StudentService;

  const actor = (overrides: Partial<AuthenticatedUser>): AuthenticatedUser => ({
    id: 'student-1',
    email: 'student@example.com',
    role: Role.STUDENT,
    teacherId: null,
    tenantId: null,
    ...overrides,
  });

  beforeEach(() => {
    repo = {
      findStudentTenant: jest.fn(),
      listScores: jest.fn().mockResolvedValue([]),
      listComments: jest.fn().mockResolvedValue([]),
    };
    prisma = {
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'student-1' }) },
      classAssistant: { findFirst: jest.fn() },
    };
    service = new StudentService(
      repo as unknown as StudentRepository,
      prisma as unknown as PrismaService,
    );
  });

  it('lists the authenticated student scores using the student row teacher scope', async () => {
    repo.findStudentTenant.mockResolvedValue({ id: 'student-1', teacherId: 'teacher-1' });

    await service.listMyScores(actor({ id: 'student-1' }));

    expect(repo.findStudentTenant).toHaveBeenCalledWith('student-1');
    expect(repo.listScores).toHaveBeenCalledWith('student-1', 'teacher-1');
  });

  it('lists the authenticated student comments using tenant context when present', async () => {
    await service.listMyComments(actor({ id: 'student-1', tenantId: 'teacher-1' }));

    expect(repo.findStudentTenant).not.toHaveBeenCalled();
    expect(repo.listComments).toHaveBeenCalledWith('student-1', 'teacher-1');
  });

  it('rejects a student reading another student scores', async () => {
    await expect(
      service.listScores(actor({ id: 'student-1' }), 'student-2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repo.listScores).not.toHaveBeenCalled();
  });

  it('uses teacher tenant scope for teacher score reads', async () => {
    await service.listScores(
      actor({ id: 'teacher-1', role: Role.TEACHER, tenantId: 'teacher-1' }),
      'student-1',
    );

    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'student-1', teacherId: 'teacher-1', role: Role.STUDENT, deletedAt: null },
      select: { id: true },
    });
    expect(repo.listScores).toHaveBeenCalledWith('student-1', 'teacher-1');
  });

  it('fails closed when a self-scoped student has no tenant row', async () => {
    repo.findStudentTenant.mockResolvedValue({ id: 'student-1', teacherId: null });

    await expect(service.listMyComments(actor({ id: 'student-1' }))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.listComments).not.toHaveBeenCalled();
  });
});
