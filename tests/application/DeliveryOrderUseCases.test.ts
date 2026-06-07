import { CreateDeliveryOrderUseCase } from '../../src/application/usecases/CreateDeliveryOrderUseCase';
import {
  AssignDeliveryToDelivererUseCase,
  UpdateDeliveryStatusUseCase,
  TrackDeliveryOrderUseCase,
} from '../../src/application/usecases/DeliveryOrderUseCases';
import { InMemoryDeliveryOrderRepository } from '../../src/infrastructure/repositories/InMemoryRepositories';

function makeValidInput() {
  return {
    senderName: 'Empresa Remetente',
    senderPhone: '(11) 91111-1111',
    recipientName: 'João Destinatário',
    recipientPhone: '(11) 92222-2222',
    pickup: {
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      latitude: -23.5629,
      longitude: -46.6544,
    },
    delivery: {
      street: 'Rua Augusta',
      number: '500',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-100',
      latitude: -23.5530,
      longitude: -46.6599,
    },
    package: {
      weightKg: 1.5,
      widthCm: 25,
      heightCm: 15,
      depthCm: 10,
    },
  };
}

describe('CreateDeliveryOrderUseCase', () => {
  let repo: InMemoryDeliveryOrderRepository;
  let useCase: CreateDeliveryOrderUseCase;

  beforeEach(() => {
    repo = new InMemoryDeliveryOrderRepository();
    useCase = new CreateDeliveryOrderUseCase(repo);
  });

  it('deve criar pedido e salvar no repositório', () => {
    const output = useCase.execute(makeValidInput());
    expect(output.orderId).toBeDefined();
    expect(output.trackingCode).toMatch(/^[A-Z]{2}\d{9}BR$/);
    expect(output.status).toBe('Aguardando Coleta');
    expect(output.estimatedDistanceKm).toBeGreaterThanOrEqual(0);

    const saved = repo.findById(output.orderId);
    expect(saved).toBeDefined();
  });

  it('deve lançar erro para coordenadas inválidas', () => {
    const input = makeValidInput();
    input.pickup.latitude = 999;
    expect(() => useCase.execute(input)).toThrow('Latitude inválida');
  });
});

describe('AssignDeliveryToDelivererUseCase', () => {
  let repo: InMemoryDeliveryOrderRepository;
  let createUC: CreateDeliveryOrderUseCase;
  let assignUC: AssignDeliveryToDelivererUseCase;

  beforeEach(() => {
    repo = new InMemoryDeliveryOrderRepository();
    createUC = new CreateDeliveryOrderUseCase(repo);
    assignUC = new AssignDeliveryToDelivererUseCase(repo);
  });

  it('deve atribuir entregador e mudar status para COLLECTED', () => {
    const { orderId } = createUC.execute(makeValidInput());
    assignUC.execute({ orderId, delivererId: 'deliverer-abc' });

    const order = repo.findById(orderId)!;
    expect(order.status.isCollected()).toBe(true);
    expect(order.assignedDelivererId).toBe('deliverer-abc');
  });

  it('deve lançar erro para pedido inexistente', () => {
    expect(() =>
      assignUC.execute({ orderId: 'nao-existe', delivererId: 'd1' })
    ).toThrow('não encontrado');
  });
});

describe('UpdateDeliveryStatusUseCase', () => {
  let repo: InMemoryDeliveryOrderRepository;
  let createUC: CreateDeliveryOrderUseCase;
  let updateUC: UpdateDeliveryStatusUseCase;

  beforeEach(() => {
    repo = new InMemoryDeliveryOrderRepository();
    createUC = new CreateDeliveryOrderUseCase(repo);
    updateUC = new UpdateDeliveryStatusUseCase(repo);
  });

  it('deve avançar pedido pelo fluxo completo', () => {
    const { orderId } = createUC.execute(makeValidInput());

    // Coleta
    repo.findById(orderId)!.collect('d1');
    repo.save(repo.findById(orderId)!);

    // Inicia trânsito
    const r1 = updateUC.execute({ orderId, action: 'START_TRANSIT', routeId: 'route-01' });
    expect(r1.newStatus).toBe('Em Trânsito');

    // Confirma entrega
    const r2 = updateUC.execute({ orderId, action: 'CONFIRM_DELIVERY' });
    expect(r2.newStatus).toBe('Entregue');
  });

  it('deve registrar falha com motivo', () => {
    const { orderId } = createUC.execute(makeValidInput());
    repo.findById(orderId)!.collect('d1');
    repo.save(repo.findById(orderId)!);
    updateUC.execute({ orderId, action: 'START_TRANSIT', routeId: 'route-01' });

    const result = updateUC.execute({
      orderId,
      action: 'REGISTER_FAILURE',
      failureReason: 'Portão fechado',
    });
    expect(result.newStatus).toBe('Falha na Entrega');
  });

  it('deve lançar erro se START_TRANSIT for chamado sem routeId', () => {
    const { orderId } = createUC.execute(makeValidInput());
    repo.findById(orderId)!.collect('d1');
    repo.save(repo.findById(orderId)!);
    expect(() =>
      updateUC.execute({ orderId, action: 'START_TRANSIT' })
    ).toThrow('routeId é obrigatório');
  });
});

describe('TrackDeliveryOrderUseCase', () => {
  it('deve rastrear pedido pelo código de rastreamento', () => {
    const repo = new InMemoryDeliveryOrderRepository();
    const createUC = new CreateDeliveryOrderUseCase(repo);
    const trackUC = new TrackDeliveryOrderUseCase(repo);

    const { trackingCode } = createUC.execute(makeValidInput());
    const result = trackUC.execute({ trackingCode });

    expect(result.trackingCode).toBe(trackingCode);
    expect(result.status).toBe('Aguardando Coleta');
    expect(result.recipientName).toBe('João Destinatário');
  });

  it('deve lançar erro para código inexistente', () => {
    const repo = new InMemoryDeliveryOrderRepository();
    const trackUC = new TrackDeliveryOrderUseCase(repo);
    expect(() => trackUC.execute({ trackingCode: 'INVALIDO' })).toThrow('não encontrado');
  });
});
