# 🚚 Sistema de Logística e Entregas Urbanas (Last Mile)

> **Projeto Prático Integrador — Disciplina: Orientação a Objetos**  
> Tema 3: Sistema de Logística e Entregas Urbanas

[![CI](https://github.com/SEU_USUARIO/poo-pbl-grupo-lastmile/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU_USUARIO/poo-pbl-grupo-lastmile/actions/workflows/ci.yml)

---

## 📋 Sumário

- [O Problema](#-o-problema)
- [Arquitetura e Design](#-arquitetura-e-design)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar](#-como-executar)
- [Rodando os Testes](#-rodando-os-testes)
- [Modelagem de Domínio (DDD)](#-modelagem-de-domínio-ddd)
- [CI/CD com GitHub Actions](#-cicd-com-github-actions)

---

## 🎯 O Problema

Uma empresa local de entregas precisa controlar toda a operação last-mile:

- Cadastro e gestão da **frota de veículos** e **entregadores**
- Criação e rastreamento de **pedidos de entrega** com código de rastreamento
- Montagem e execução de **rotas** otimizadas com múltiplas paradas
- Controle de **estados** do pedido: coleta → trânsito → entrega/falha

---

## 🏗️ Arquitetura e Design

O projeto aplica **Domain-Driven Design (DDD)** com separação clara em camadas:

```
Presentation  ←→  Application (Use Cases)  ←→  Domain  ←  Infrastructure
```

### Pilares de OO aplicados

| Pilar | Onde aparece |
|---|---|
| **Encapsulamento** | Todos os atributos `private readonly`; mutação apenas via métodos de domínio |
| **Herança/Composição** | Preferência por composição (Aggregate contém Entities e Value Objects) |
| **Polimorfismo** | `DeliveryStatus` encapsula comportamento polimórfico nas transições de estado |
| **Alta coesão** | Cada classe tem responsabilidade única e bem definida |

---

## 📁 Estrutura do Projeto

```
poo-pbl-grupo-lastmile/
├── .github/
│   └── workflows/
│       └── ci.yml                     ← Pipeline GitHub Actions
├── src/
│   ├── domain/                        ← Core Domain (DDD)
│   │   ├── aggregates/
│   │   │   ├── DeliveryOrder.ts       ← Aggregate Root: Pedido de Entrega
│   │   │   ├── Fleet.ts               ← Aggregate Root: Frota
│   │   │   └── Route.ts               ← Aggregate Root: Rota
│   │   ├── entities/
│   │   │   ├── Deliverer.ts           ← Entidade: Entregador
│   │   │   ├── Vehicle.ts             ← Entidade: Veículo
│   │   │   └── RouteStop.ts           ← Entidade: Parada de Rota
│   │   ├── valueobjects/
│   │   │   ├── Coordinate.ts          ← VO: Coordenada + Distância (Haversine)
│   │   │   ├── Address.ts             ← VO: Endereço completo com validação de CEP
│   │   │   ├── DeliveryStatus.ts      ← VO: Estado do pedido + máquina de estados
│   │   │   └── VehicleCapacity.ts     ← VO: Capacidade do veículo + Dimensões do pacote
│   │   └── repositories/
│   │       └── IRepositories.ts       ← Interfaces (contratos do domínio)
│   ├── application/
│   │   └── usecases/
│   │       ├── CreateDeliveryOrderUseCase.ts
│   │       ├── DeliveryOrderUseCases.ts
│   │       └── FleetAndRouteUseCases.ts
│   └── infrastructure/
│       └── repositories/
│           └── InMemoryRepositories.ts ← Implementações em memória
├── tests/
│   ├── domain/
│   │   ├── Coordinate.test.ts
│   │   ├── DeliveryStatus.test.ts
│   │   ├── DeliveryOrder.test.ts
│   │   ├── Deliverer.test.ts
│   │   ├── Route.test.ts
│   │   ├── Fleet.test.ts
│   │   └── Vehicle.test.ts
│   └── application/
│       └── DeliveryOrderUseCases.test.ts
├── project-meta.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** >= 20
- **npm** >= 9

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/poo-pbl-grupo-lastmile.git
cd poo-pbl-grupo-lastmile

# Instale as dependências
npm install
```

### Build

```bash
npm run build
```

---

## 🧪 Rodando os Testes

```bash
# Rodar todos os testes com relatório de cobertura
npm test

# Modo watch (desenvolvimento)
npm run test:watch
```

### Cobertura esperada

| Camada | Cobertura Alvo |
|---|---|
| `src/domain/` | ≥ 85% |
| `src/application/` | ≥ 80% |

---

## 🧠 Modelagem de Domínio (DDD)

### Contextos Delimitados (Bounded Contexts)

```
┌─────────────────────┐   ┌──────────────────────┐   ┌────────────────────┐
│  Frotas/Entregadores│   │    Roteirização       │   │  Pedidos/Entregas  │
│                     │   │                      │   │                    │
│  Fleet (AR)         │   │  Route (AR)          │   │  DeliveryOrder(AR) │
│  ├─ Deliverer       │   │  └─ RouteStop        │   │                    │
│  └─ Vehicle         │   │                      │   │                    │
└─────────────────────┘   └──────────────────────┘   └────────────────────┘
```

### Value Objects Principais

| Value Object | Invariante garantida |
|---|---|
| `Coordinate` | Latitude ∈ [-90,90], Longitude ∈ [-180,180]. Calcula distância com Haversine |
| `Distance` | Sempre não-negativa. Operações imutáveis (add retorna nova instância) |
| `Address` | CEP válido no formato brasileiro, campos obrigatórios não-vazios |
| `DeliveryStatus` | Máquina de estados: valida transições antes de aplicar |
| `PackageDimensions` | Peso e dimensões sempre positivos. `volumeM3` calculado |
| `VehicleCapacity` | Peso e volume máximos positivos. `canFit()` verifica compatibilidade |

### Aggregate Roots e Invariantes

**`DeliveryOrder`** — garante:
- Endereços de coleta ≠ entrega
- Transições de estado válidas (não pula etapas)
- `failureReason` obrigatório ao registrar falha
- `deliveredAt` registrado automaticamente

**`Route`** — garante:
- Não adiciona paradas duplicadas para o mesmo pedido/tipo
- Não inicia rota vazia
- Auto-completa quando todas as paradas são concluídas

**`Fleet`** — garante:
- Veículo não é atribuído a dois entregadores simultaneamente
- Entregador só recebe veículo se disponível

### Fluxo de Estado do Pedido

```
  PENDING
     │
     ▼
  COLLECTED ──────────────────────────────────┐
     │                                        │
     ▼                                        │
  IN_TRANSIT ──► FAILED ──► IN_TRANSIT (retry)│
     │              │                         │
     ▼              ▼                         │
  DELIVERED      RETURNED                 CANCELLED
```

---

## ⚙️ CI/CD com GitHub Actions

A cada `push` ou `pull_request` para `main`:

1. ✅ Checkout do código
2. ✅ Setup Node.js 20
3. ✅ `npm ci` — instalação limpa de dependências
4. ✅ `npm run build` — compilação TypeScript
5. ✅ `npm test -- --ci --coverage` — execução dos testes com cobertura
6. ✅ Upload do relatório de cobertura como artefato

> O pipeline **não passa** se qualquer teste falhar ou o build quebrar.

---

## 👥 Integrantes

| Nome | GitHub |
|---|---|
| Felipe Tavares | [@integrante1](https://github.com/Felipetavaress312) |
| Integrante 2 | [@integrante2](https://github.com/integrante2) |
| Integrante 3 | [@integrante3](https://github.com/integrante3) |
| Integrante 4 | [@integrante4](https://github.com/integrante4) |
