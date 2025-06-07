/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('crea y guarda un usuario', async () => {
      const mockUser = { username: 'test', password: 'pass' };
      userRepo.create.mockReturnValue(mockUser as User);
      userRepo.save.mockResolvedValue({ id: 1, ...mockUser } as User);

      const result = await service.createUser('test', 'pass');

      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'test',
        password: 'pass',
      });
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ id: 1, username: 'test', password: 'pass' });
    });
  });

  describe('findByUsername', () => {
    it('devuelve un usuario por username', async () => {
      const user = { id: 1, username: 'alex', password: 'secret' };
      userRepo.findOne.mockResolvedValue(user as User);

      const result = await service.findByUsername('alex');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'alex' },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('devuelve un usuario por id', async () => {
      const user = { id: 5, username: 'maria', password: '123' };
      userRepo.findOne.mockResolvedValue(user as User);

      const result = await service.findById(5);

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(result).toEqual(user);
    });
  });
});
