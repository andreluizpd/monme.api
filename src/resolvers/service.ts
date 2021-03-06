import { Service } from '../entities/Service';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { MyContext } from '../types';
import { isAuth } from '../middleware/isAuth';
import { User } from '../entities/User';

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  price: number;
}

@Resolver(Service)
export class ServiceResolver {
  @FieldResolver(() => User)
  creator(@Root() service: Service, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(service.creatorId);
  }

  @Query(() => [Service])
  services(): Promise<Service[]> {
    return Service.find();
  }

  @Query(() => Service, { nullable: true })
  service(@Arg('id') id: number): Promise<Service | undefined> {
    return Service.findOne(id);
  }

  @Mutation(() => Service)
  @UseMiddleware(isAuth)
  async createService(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Service> {
    return Service.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Service, { nullable: true })
  async updateService(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Service | null> {
    const service = await Service.findOne(id);

    if (!service) {
      return null;
    }

    if (typeof title !== 'undefined') {
      service.title = title;
      await Service.update({ id }, { title });
    }

    return service;
  }

  @Mutation(() => Boolean)
  async deleteService(@Arg('id') id: number): Promise<boolean> {
    await Service.delete(id);

    return true;
  }
}
