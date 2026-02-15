import { Entity } from './entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  // Can be extended with Domain Events later
  // private _domainEvents: DomainEvent[] = [];
}
