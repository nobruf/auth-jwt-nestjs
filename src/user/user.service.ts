import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: 'User already exists with this email!',
        },
        HttpStatus.CONFLICT,
      );
    }
    const data: Prisma.UserCreateInput = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };

    const createdUser = await this.prisma.user.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  async listAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    return users;
  }

  async listOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      ...user,
      password: undefined,
    };
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { name, password, newpassword } = updateUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const data: Prisma.UserUpdateInput = {};

    if (name) {
      data.name = name;
    }

    if (password) {
      const passwordValid = await bcrypt.compare(
        password,
        existingUser.password,
      );
      if (passwordValid) {
        data.password = await bcrypt.hash(newpassword, 10);
      } else {
        throw new HttpException(
          'Invalid current password!',
          HttpStatus.CONFLICT,
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return {
      ...updatedUser,
      password: undefined,
    };
  }

  async deleteOne(id: number) {
    try {
      const user = await this.prisma.user.delete({ where: { id } });
      return {
        ...user,
        password: undefined,
      };
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
