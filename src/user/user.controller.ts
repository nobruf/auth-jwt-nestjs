import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put('update/:id')
  updateOne(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateOne(id, updateUserDto);
  }

  @Get()
  listAll() {
    return this.userService.listAll();
  }

  @Get(':id')
  listOne(@Param('id') id: number): any {
    return this.userService.listOne(id);
  }

  @Delete('delete/:id')
  deleteOne(@Param('id') id: number): any {
    return this.userService.deleteOne(id);
  }
}
