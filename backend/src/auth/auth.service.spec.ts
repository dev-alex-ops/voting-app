/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario correctamente', async () => {
      userRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      userRepo.create.mockReturnValue({
        username: 'newuser',
        password: 'hashed-password',
        id: 0,
        votes: [],
      });
      userRepo.save.mockResolvedValue({
        id: 0,
        username: 'newuser',
        password: 'hashed-password',
        votes: [],
      });

      await service.register('newuser', 'plain-password');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'newuser' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'hashed-password',
      });
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('lanza ConflictException si el usuario ya existe', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        username: 'existing',
        password: 'hashed',
        votes: [],
      });

      await expect(service.register('existing', '123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('devuelve token si usuario y contraseña son válidos', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        username: 'user',
        password: 'hashed',
        votes: [],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('mocked-token');

      const result = await service.login('user', 'plain');
      expect(result).toEqual({ access_token: 'mocked-token' });

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'user' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('plain', 'hashed');
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1 });
    });

    it('lanza NotFoundException si el usuario no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login('nouser', '123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        username: 'user',
        password: 'hashed',
        votes: [],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('user', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
