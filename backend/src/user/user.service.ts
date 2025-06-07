import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createUser(username: string, password: string) {
    const user = this.userRepo.create({ username, password });
    return this.userRepo.save(user);
  }

  async findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } });
  }

  async findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }
}
