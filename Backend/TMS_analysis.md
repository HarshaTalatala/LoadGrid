# TMS Codebase Analysis

## Evidence policy

This analysis is based on the implementation, configuration, and tests in this repository. Claims cite repository paths and line ranges. `INFERRED` marks an interpretation that follows from code but is not explicitly modeled. `UNKNOWN` means the repository does not establish the answer. The README is used only where it agrees with executable code; it contains stale or contradictory material, so implementation files take precedence.

## 1. Product

### Name and purpose

TMS stands for **Transport Management System**. This is explicit in the application name and OpenAPI title: [src/main/java/com/harsha/tms/config/OpenApiConfig.java#L15-L24](src/main/java/com/harsha/tms/config/OpenApiConfig.java#L15-L24) and [src/main/resources/application.properties#L1-L1](src/main/resources/application.properties#L1-L1).

The system stores transportation loads, transporters, truck inventory, bids, and bookings. A load contains shipper, route, cargo, date, price, and truck requirements; it is related to bids and bookings. A transporter has trucks, bids, and bookings. [src/main/java/com/harsha/tms/entity/Load.java#L19-L90](src/main/java/com/harsha/tms/entity/Load.java#L19-L90), [src/main/java/com/harsha/tms/entity/Transporter.java#L14-L47](src/main/java/com/harsha/tms/entity/Transporter.java#L14-L47)

### Users and roles

- **Shipper: INFERRED.** `Load.shipperId` and load filtering by `shipperId` indicate a party that creates or owns loads, but there is no shipper entity or account. [src/main/java/com/harsha/tms/entity/Load.java#L43-L52](src/main/java/com/harsha/tms/entity/Load.java#L43-L52), [src/main/java/com/harsha/tms/controller/LoadController.java#L39-L46](src/main/java/com/harsha/tms/controller/LoadController.java#L39-L46)
- **Transporter: explicit domain object.** Transporters have company name, rating, truck inventory, bids, and bookings. [src/main/java/com/harsha/tms/entity/Transporter.java#L14-L47](src/main/java/com/harsha/tms/entity/Transporter.java#L14-L47)
- **Load/bookings operator: INFERRED.** The API exposes bid rejection and booking creation, but no actor identity or operator entity is present. [src/main/java/com/harsha/tms/controller/BidController.java#L48-L58](src/main/java/com/harsha/tms/controller/BidController.java#L48-L58), [src/main/java/com/harsha/tms/controller/BookingController.java#L27-L45](src/main/java/com/harsha/tms/controller/BookingController.java#L27-L45)
- Authentication-backed roles: **UNKNOWN; no implementation exists.**

### Core features

1. Create and query loads, filter by shipper/status, cancel loads, and rank bids for a load. [src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68](src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68)
2. Submit, query, inspect, and reject bids. [src/main/java/com/harsha/tms/controller/BidController.java#L22-L58](src/main/java/com/harsha/tms/controller/BidController.java#L22-L58)
3. Create, inspect, and cancel bookings. [src/main/java/com/harsha/tms/controller/BookingController.java#L18-L45](src/main/java/com/harsha/tms/controller/BookingController.java#L18-L45)
4. Create transporters, inspect them, and replace their truck inventory. [src/main/java/com/harsha/tms/controller/TransporterController.java#L18-L47](src/main/java/com/harsha/tms/controller/TransporterController.java#L18-L47)

Notifications, messaging, tracking, payments, and carrier integrations: **UNKNOWN; no such code is present.**

## 2. Tech stack

| Area | Evidence-based answer |
|---|---|
| Backend | Java project using Spring Boot parent `4.0.0`; Spring MVC, Spring Data JPA, and Bean Validation starters. [pom.xml#L1-L13](pom.xml#L1-L13), [pom.xml#L37-L47](pom.xml#L37-L47) |
| Java configuration | `java.version` is `25`, while compiler source, target, and release are `21`. The effective runtime/build policy is not fully established by the repository. [pom.xml#L24-L29](pom.xml#L24-L29) |
| Build | Maven with Maven Wrapper files. [pom.xml#L1-L3](pom.xml#L1-L3), [mvnw.cmd#L1-L1](mvnw.cmd#L1-L1) |
| Persistence | JPA repositories over PostgreSQL at runtime; Hibernate is brought through Spring Data JPA. [pom.xml#L37-L44](pom.xml#L37-L44), [src/main/resources/application.properties#L3-L10](src/main/resources/application.properties#L3-L10) |
| Test database | H2 in-memory database with `create-drop`. [pom.xml#L48-L51](pom.xml#L48-L51), [src/test/resources/application.properties#L3-L14](src/test/resources/application.properties#L3-L14) |
| API documentation | Springdoc OpenAPI Web MVC UI `2.7.0`; paths are configured as `/v1/api-docs` and `/swagger-ui/index.html`. [pom.xml#L63-L67](pom.xml#L63-L67), [src/main/resources/application.properties#L12-L14](src/main/resources/application.properties#L12-L14) |
| Boilerplate | Lombok, version managed by the Spring Boot dependency management; no explicit Lombok version appears. [pom.xml#L52-L56](pom.xml#L52-L56) |
| Testing | Spring Boot test starter; the code uses JUnit 5 and Mockito APIs. Exact transitive versions are not declared in this POM. [pom.xml#L57-L61](pom.xml#L57-L61), [src/test/java/com/harsha/tms/service/BidServiceImplTest.java#L1-L35](src/test/java/com/harsha/tms/service/BidServiceImplTest.java#L1-L35) |
| Coverage | JaCoCo `0.8.12`. [pom.xml#L91-L115](pom.xml#L91-L115) |
| Frontend | **UNKNOWN / none in this repository.** No frontend source, package manifest, or frontend build dependency is present in the workspace; the POM contains backend dependencies only. [pom.xml#L37-L73](pom.xml#L37-L73) |
| Authentication | **UNKNOWN / not implemented in the repository.** No security dependency or security configuration exists in the POM or main source tree. [pom.xml#L37-L73](pom.xml#L37-L73) |
| Third-party runtime services | **UNKNOWN.** No payment, messaging, maps, carrier, or external HTTP client integration is present in the source tree. |

## 3. Architecture

### Folder structure

- `controller`: HTTP boundary and DTO binding. [src/main/java/com/harsha/tms/controller/LoadController.java#L1-L24](src/main/java/com/harsha/tms/controller/LoadController.java#L1-L24)
- `dto/request` and `dto/response`: request records and response records. [src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L1-L51](src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L1-L51), [src/main/java/com/harsha/tms/dto/response/LoadResponseDTO.java#L1-L30](src/main/java/com/harsha/tms/dto/response/LoadResponseDTO.java#L1-L30)
- `service` and `service/impl`: interfaces and transactional business logic. [src/main/java/com/harsha/tms/service/LoadService.java#L1-L20](src/main/java/com/harsha/tms/service/LoadService.java#L1-L20), [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L25-L38](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L25-L38)
- `repository`: Spring Data JPA repositories. [src/main/java/com/harsha/tms/repository/LoadRepository.java#L1-L20](src/main/java/com/harsha/tms/repository/LoadRepository.java#L1-L20)
- `entity`: persisted domain model and enums. [src/main/java/com/harsha/tms/entity/Load.java#L19-L90](src/main/java/com/harsha/tms/entity/Load.java#L19-L90)
- `exception/handler`: centralized HTTP error conversion. [src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L17-L91](src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L17-L91)
- `config`: OpenAPI configuration. [src/main/java/com/harsha/tms/config/OpenApiConfig.java#L10-L27](src/main/java/com/harsha/tms/config/OpenApiConfig.java#L10-L27)

The application is bootstrapped by `@SpringBootApplication`; it also exposes a UTC `Clock` bean used by services. [src/main/java/com/harsha/tms/TransportManagementSystemApplication.java#L7-L19](src/main/java/com/harsha/tms/TransportManagementSystemApplication.java#L7-L19)

### Communication and request flow

There is no frontend in the repository. The proven communication surface is HTTP JSON endpoints handled by Spring MVC controllers; controllers delegate to services, which call JPA repositories. [src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68](src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68), [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L39-L69](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L39-L69), [src/main/java/com/harsha/tms/repository/LoadRepository.java#L10-L20](src/main/java/com/harsha/tms/repository/LoadRepository.java#L10-L20)

### Three important feature flows

#### A. Create a load

1. Client sends `POST /load` with a validated `LoadRequestDTO`. [src/main/java/com/harsha/tms/controller/LoadController.java#L29-L34](src/main/java/com/harsha/tms/controller/LoadController.java#L29-L34)
2. The service copies request fields into a new `Load`. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L39-L54](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L39-L54)
3. It initializes `remainingTrucks` to `trucksRequired`, status to `POSTED`, and `datePosted` from the injected clock. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L55-L57](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L55-L57)
4. `LoadRepository.save` persists it, and the service maps it to a response DTO. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L59-L75](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L59-L75)

#### B. Submit and rank bids

1. Client sends `POST /bid`; Bean Validation checks IDs, positive rate, truck count, and truck type. [src/main/java/com/harsha/tms/controller/BidController.java#L27-L31](src/main/java/com/harsha/tms/controller/BidController.java#L27-L31), [src/main/java/com/harsha/tms/dto/request/BidRequestDTO.java#L8-L28](src/main/java/com/harsha/tms/dto/request/BidRequestDTO.java#L8-L28)
2. The service loads the load and transporter, then rejects bidding for `BOOKED` or `CANCELLED`. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L46-L56](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L46-L56), [src/main/java/com/harsha/tms/service/LoadStatusValidator.java#L10-L24](src/main/java/com/harsha/tms/service/LoadStatusValidator.java#L10-L24)
3. It sums matching truck-type inventory and rejects insufficient capacity. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L58-L70](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L58-L70)
4. The first bid changes a `POSTED` load to `OPEN_FOR_BIDS`; an existing accepted bid blocks new bids. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L72-L88](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L72-L88)
5. The bid is saved as `PENDING` with a UTC timestamp. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L90-L101](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L90-L101)
6. `GET /load/{id}/best-bids` loads all bids, computes `0.7 * (1 / proposedRate) + 0.3 * (rating / 5)`, sorts descending, and maps responses. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L158-L184](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L158-L184), [src/main/java/com/harsha/tms/service/ScoreWeights.java#L3-L13](src/main/java/com/harsha/tms/service/ScoreWeights.java#L3-L13)

#### C. Create and cancel a booking

1. Client sends `POST /booking` with load, bid, transporter, allocated truck count, and final rate. [src/main/java/com/harsha/tms/controller/BookingController.java#L27-L31](src/main/java/com/harsha/tms/controller/BookingController.java#L27-L31), [src/main/java/com/harsha/tms/dto/request/BookingRequestDTO.java#L7-L27](src/main/java/com/harsha/tms/dto/request/BookingRequestDTO.java#L7-L27)
2. The service independently loads the three requested records and checks whether the load already has an accepted bid. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L77](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L77)
3. It checks load capacity and transporter inventory for the bid's truck type. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L105](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L105)
4. It deducts trucks, decrements remaining load capacity, changes the load to `BOOKED` when capacity reaches zero, creates a `CONFIRMED` booking, then marks the bid `ACCEPTED`. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L107-L145](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L107-L145)
5. On optimistic-lock failure, it translates the conflict to `LoadAlreadyBookedException`. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149)
6. Cancellation restores matching truck inventory and load capacity, changes a fully restored `BOOKED` load to `OPEN_FOR_BIDS`, and marks the booking `CANCELLED`. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L162-L203](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L162-L203)

## 4. Domain logic

### Entities and relationships

- `Load`: UUID ID, optimistic-lock `version`, shipper UUID, route/cargo/weight/price/date fields, required and remaining truck counts, status, and one-to-many bids/bookings. [src/main/java/com/harsha/tms/entity/Load.java#L31-L90](src/main/java/com/harsha/tms/entity/Load.java#L31-L90)
- `Transporter`: UUID ID, company name, rating, and one-to-many trucks, bids, and bookings. [src/main/java/com/harsha/tms/entity/Transporter.java#L20-L47](src/main/java/com/harsha/tms/entity/Transporter.java#L20-L47)
- `Truck`: UUID ID, truck type, aggregate count, and many-to-one transporter. [src/main/java/com/harsha/tms/entity/Truck.java#L12-L35](src/main/java/com/harsha/tms/entity/Truck.java#L12-L35)
- `Bid`: UUID ID, proposed rate, offered trucks/type, status, submitted time, and many-to-one load/transporter. [src/main/java/com/harsha/tms/entity/Bid.java#L29-L60](src/main/java/com/harsha/tms/entity/Bid.java#L29-L60)
- `Booking`: UUID ID, allocated trucks, final rate, status, booked time, and many-to-one load/bid/transporter. [src/main/java/com/harsha/tms/entity/Booking.java#L21-L65](src/main/java/com/harsha/tms/entity/Booking.java#L21-L65)

### Statuses and lifecycle

Load/booking status enum values are `POSTED`, `OPEN_FOR_BIDS`, `BOOKED`, `CONFIRMED`, `IN_TRANSIT`, `COMPLETED`, and `CANCELLED`. [src/main/java/com/harsha/tms/entity/BookingStatus.java#L3-L11](src/main/java/com/harsha/tms/entity/BookingStatus.java#L3-L11)

The implemented common path is `POSTED -> OPEN_FOR_BIDS -> BOOKED` as bids arrive and remaining truck capacity reaches zero. A booking itself is created as `CONFIRMED`; the code does not implement transitions to `IN_TRANSIT` or `COMPLETED`. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L55-L57](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L55-L57), [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L72-L76](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L72-L76), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L115-L145](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L115-L145)

Bid statuses are `PENDING`, `ACCEPTED`, and `REJECTED`. [src/main/java/com/harsha/tms/entity/BidStatus.java#L3-L7](src/main/java/com/harsha/tms/entity/BidStatus.java#L3-L7)

### Rules and workflow logic

- Request validation requires positive weight/price, future pickup and delivery dates, at least one required/offered/allocated truck, nonblank locations/cargo/truck type, and required IDs. [src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L11-L51](src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L11-L51), [src/main/java/com/harsha/tms/dto/request/BidRequestDTO.java#L8-L28](src/main/java/com/harsha/tms/dto/request/BidRequestDTO.java#L8-L28), [src/main/java/com/harsha/tms/dto/request/BookingRequestDTO.java#L7-L27](src/main/java/com/harsha/tms/dto/request/BookingRequestDTO.java#L7-L27)
- Bid submission requires enough matching truck inventory. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L58-L70](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L58-L70)
- Booking requires enough remaining load trucks and enough transporter trucks of the bid type. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L105](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L105)
- Only one accepted bid is intended per load, checked in bid submission and booking logic. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L82-L88](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L82-L88), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L68-L77](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L68-L77)
- A `Load` has optimistic locking through `@Version`, and booking catches the corresponding optimistic-lock exception. [src/main/java/com/harsha/tms/entity/Load.java#L34-L35](src/main/java/com/harsha/tms/entity/Load.java#L34-L35), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149)
- Truck updates replace all existing truck rows with the supplied list. [src/main/java/com/harsha/tms/service/impl/TransporterServiceImpl.java#L58-L77](src/main/java/com/harsha/tms/service/impl/TransporterServiceImpl.java#L58-L77)
- Notifications: **UNKNOWN / not implemented.**

## 5. Backend

### APIs

| Method | Path | Purpose | Evidence |
|---|---|---|---|
| POST | `/load` | Create load | [LoadController.java#L29-L34](src/main/java/com/harsha/tms/controller/LoadController.java#L29-L34) |
| GET | `/load` | List/filter loads with `shipperId`, `status`, and `Pageable` | [LoadController.java#L39-L46](src/main/java/com/harsha/tms/controller/LoadController.java#L39-L46) |
| GET | `/load/{id}` | Get load | [LoadController.java#L49-L53](src/main/java/com/harsha/tms/controller/LoadController.java#L49-L53) |
| PATCH | `/load/{id}/cancel` | Cancel load | [LoadController.java#L56-L59](src/main/java/com/harsha/tms/controller/LoadController.java#L56-L59) |
| GET | `/load/{id}/best-bids` | Rank bids | [LoadController.java#L62-L65](src/main/java/com/harsha/tms/controller/LoadController.java#L62-L65) |
| POST | `/bid` | Submit bid | [BidController.java#L27-L31](src/main/java/com/harsha/tms/controller/BidController.java#L27-L31) |
| GET | `/bid` | List/filter bids | [BidController.java#L36-L43](src/main/java/com/harsha/tms/controller/BidController.java#L36-L43) |
| GET | `/bid/{id}` | Get bid | [BidController.java#L46-L50](src/main/java/com/harsha/tms/controller/BidController.java#L46-L50) |
| PATCH | `/bid/{id}/reject` | Reject bid | [BidController.java#L53-L56](src/main/java/com/harsha/tms/controller/BidController.java#L53-L56) |
| POST | `/booking` | Create booking | [BookingController.java#L27-L31](src/main/java/com/harsha/tms/controller/BookingController.java#L27-L31) |
| GET | `/booking/{id}` | Get booking | [BookingController.java#L34-L38](src/main/java/com/harsha/tms/controller/BookingController.java#L34-L38) |
| PATCH | `/booking/{id}/cancel` | Cancel booking | [BookingController.java#L41-L44](src/main/java/com/harsha/tms/controller/BookingController.java#L41-L44) |
| POST | `/transporter` | Create transporter | [TransporterController.java#L28-L32](src/main/java/com/harsha/tms/controller/TransporterController.java#L28-L32) |
| GET | `/transporter/{id}` | Get transporter | [TransporterController.java#L35-L39](src/main/java/com/harsha/tms/controller/TransporterController.java#L35-L39) |
| PUT | `/transporter/{id}/trucks` | Replace truck inventory | [TransporterController.java#L42-L46](src/main/java/com/harsha/tms/controller/TransporterController.java#L42-L46) |

### Auth and authorization

Authentication and authorization are **UNKNOWN / absent from this codebase**. The controllers are REST controllers with no security annotations, and the POM has no Spring Security dependency. [src/main/java/com/harsha/tms/controller/LoadController.java#L25-L27](src/main/java/com/harsha/tms/controller/LoadController.java#L25-L27), [pom.xml#L37-L73](pom.xml#L37-L73)

The API accepts caller-supplied `shipperId` and `transporterId` values. There is no demonstrated check that the caller owns the referenced resource. [src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L11-L18](src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L11-L18), [src/main/java/com/harsha/tms/dto/request/BidRequestDTO.java#L8-L14](src/main/java/com/harsha/tms/dto/request/BidRequestDTO.java#L8-L14)

### Validation and errors

`@Valid` is used for load, bid, and booking requests. [src/main/java/com/harsha/tms/controller/LoadController.java#L29-L31](src/main/java/com/harsha/tms/controller/LoadController.java#L29-L31), [src/main/java/com/harsha/tms/controller/BidController.java#L27-L31](src/main/java/com/harsha/tms/controller/BidController.java#L27-L31), [src/main/java/com/harsha/tms/controller/BookingController.java#L27-L31](src/main/java/com/harsha/tms/controller/BookingController.java#L27-L31)

`TransporterRequestDTO` and `UpdateTrucksRequestDTO` have no Bean Validation annotations, and the transporter controller does not use `@Valid`. [src/main/java/com/harsha/tms/dto/request/TransporterRequestDTO.java#L3-L6](src/main/java/com/harsha/tms/dto/request/TransporterRequestDTO.java#L3-L6), [src/main/java/com/harsha/tms/dto/request/UpdateTrucksRequestDTO.java#L5-L14](src/main/java/com/harsha/tms/dto/request/UpdateTrucksRequestDTO.java#L5-L14), [src/main/java/com/harsha/tms/controller/TransporterController.java#L28-L46](src/main/java/com/harsha/tms/controller/TransporterController.java#L28-L46)

The global handler maps not-found to 404, invalid status and capacity to 400, optimistic booking conflict to 409, validation to 400, and `IllegalStateException` to 400. Its response contains only `timestamp`, `message`, and `path`. [src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L20-L91](src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L20-L91)

External integrations: **UNKNOWN / none found.**

## 6. Frontend

A frontend is **UNKNOWN / not present in this repository**. There are no frontend routes, pages, components, state-management files, browser data-fetching code, or UI auth/role handling in the workspace. The only user-facing API documentation configured is Swagger UI. [src/main/resources/application.properties#L12-L14](src/main/resources/application.properties#L12-L14), [src/main/java/com/harsha/tms/config/OpenApiConfig.java#L10-L27](src/main/java/com/harsha/tms/config/OpenApiConfig.java#L10-L27)

Therefore:

- Frontend routing: **UNKNOWN**.
- Frontend state management: **UNKNOWN**.
- Frontend data fetching: **UNKNOWN**.
- Dashboards/pages/components: **UNKNOWN**.
- UI authentication and role handling: **UNKNOWN**.

## 7. Infra

- Dockerfiles: **UNKNOWN / none found in the repository file tree**.
- CI configuration: **UNKNOWN / none found in the repository file tree**.
- Deployment manifests/cloud setup: **UNKNOWN / none found in the repository file tree**.
- Runtime database: PostgreSQL JDBC URL, database name `TransportManagementSystem`, username `harsha`, and a configured password are in the committed properties file. Password value is intentionally not repeated here. [src/main/resources/application.properties#L3-L6](src/main/resources/application.properties#L3-L6)
- Test database: H2 in-memory database named `testdb`; test username is `sa` and password is empty. [src/test/resources/application.properties#L3-L8](src/test/resources/application.properties#L3-L8)
- Relevant configuration keys: `spring.application.name`, `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`, `spring.datasource.driver-class-name`, `spring.jpa.hibernate.ddl-auto`, `spring.jpa.show-sql`, `spring.jpa.properties.hibernate.dialect`, `spring.jpa.properties.hibernate.jdbc.batch_size`, `spring.jpa.properties.hibernate.order_inserts`, `spring.jpa.properties.hibernate.order_updates`, `springdoc.api-docs.path`, `springdoc.swagger-ui.path`, `spring.h2.console.enabled`. [src/main/resources/application.properties#L1-L14](src/main/resources/application.properties#L1-L14), [src/test/resources/application.properties#L1-L16](src/test/resources/application.properties#L1-L16)
- Schema management uses `ddl-auto=update` in runtime and `create-drop` in tests. No migration tool is declared in the POM. [src/main/resources/application.properties#L7-L10](src/main/resources/application.properties#L7-L10), [src/test/resources/application.properties#L9-L14](src/test/resources/application.properties#L9-L14), [pom.xml#L37-L73](pom.xml#L37-L73)

## 8. Testing

### What exists

There are six test classes: one Spring context test, four service implementation test classes, and one enum test. [src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L1-L12](src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L1-L12), [src/test/java/com/harsha/tms/service/LoadServiceImplTest.java#L38-L44](src/test/java/com/harsha/tms/service/LoadServiceImplTest.java#L38-L44), [src/test/java/com/harsha/tms/service/BidServiceImplTest.java#L40-L46](src/test/java/com/harsha/tms/service/BidServiceImplTest.java#L40-L46), [src/test/java/com/harsha/tms/service/BookingServiceImplTest.java#L41-L47](src/test/java/com/harsha/tms/service/BookingServiceImplTest.java#L41-L47), [src/test/java/com/harsha/tms/service/TransporterServiceImplTest.java#L32-L38](src/test/java/com/harsha/tms/service/TransporterServiceImplTest.java#L32-L38), [src/test/java/com/harsha/tms/entity/WeightUnitTest.java#L1-L22](src/test/java/com/harsha/tms/entity/WeightUnitTest.java#L1-L22)

The service tests use Mockito mocks and cover successful paths, not-found cases, filtering, capacity failures, duplicate accepted-bid checks, and truck replacement. [src/test/java/com/harsha/tms/service/LoadServiceImplTest.java#L91-L228](src/test/java/com/harsha/tms/service/LoadServiceImplTest.java#L91-L228), [src/test/java/com/harsha/tms/service/BidServiceImplTest.java#L100-L288](src/test/java/com/harsha/tms/service/BidServiceImplTest.java#L100-L288), [src/test/java/com/harsha/tms/service/BookingServiceImplTest.java#L113-L298](src/test/java/com/harsha/tms/service/BookingServiceImplTest.java#L113-L298), [src/test/java/com/harsha/tms/service/TransporterServiceImplTest.java#L65-L176](src/test/java/com/harsha/tms/service/TransporterServiceImplTest.java#L65-L176)

The application context test uses `@SpringBootTest`; the enum test verifies exactly two weight units, `KG` and `TON`. [src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L5-L12](src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L5-L12), [src/test/java/com/harsha/tms/entity/WeightUnitTest.java#L8-L22](src/test/java/com/harsha/tms/entity/WeightUnitTest.java#L8-L22)

### What is missing

There are no controller/API integration tests, repository tests, validation tests, authorization tests, concurrency tests, migration tests, frontend tests, or end-to-end tests in the repository. **UNKNOWN** whether such tests exist outside this repository.

### How to run

The POM configures tests through Maven Surefire and JaCoCo. The repository contains Maven wrapper scripts. The directly supported command is `./mvnw test` on Unix-like systems or `mvnw.cmd test` on Windows. [pom.xml#L75-L90](pom.xml#L75-L90), [pom.xml#L91-L115](pom.xml#L91-L115), [mvnw.cmd#L1-L1](mvnw.cmd#L1-L1)

## 9. Hard parts

1. **Capacity allocation across load and transporter inventory.** Booking checks both remaining load capacity and truck-type inventory, then mutates both inside a transaction. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L124](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L124). This is interesting because one booking operation must keep two aggregates consistent.
2. **Concurrent booking protection.** `Load.version` uses JPA optimistic locking; a conflict is translated to a domain-specific conflict exception. [src/main/java/com/harsha/tms/entity/Load.java#L31-L35](src/main/java/com/harsha/tms/entity/Load.java#L31-L35), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149). This addresses competing updates to the same load, although the behavior is not integration-tested.
3. **Bid ranking.** The service converts price and rating into a single score with explicit weights and sorts descending. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L158-L184](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L158-L184), [src/main/java/com/harsha/tms/service/ScoreWeights.java#L3-L13](src/main/java/com/harsha/tms/service/ScoreWeights.java#L3-L13). The design makes the tradeoff explicit, but it is not normalized beyond reciprocal price and a five-point rating scale.
4. **Filtered pagination.** Unfiltered loads use a repository `Page`, while filtered loads fetch a list and construct a `PageImpl` using an in-memory sublist. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L95-L126](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L95-L126). This preserves a paged response shape but moves filtering pagination into application memory.
5. **Layered error translation.** Domain exceptions are converted centrally to HTTP status and a small error DTO through `@ControllerAdvice`. [src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L17-L91](src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L17-L91). This avoids repeating exception-to-response logic in controllers.

## 10. Weaknesses and interview risks

1. **No authentication or authorization.** Any caller who knows IDs can invoke mutation endpoints; the code has no security dependency, principal, ownership check, or role annotation. [pom.xml#L37-L73](pom.xml#L37-L73), [src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68](src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68)
2. **Booking does not verify relationships among request IDs.** It independently loads `loadId`, `bidId`, and `transporterId`, but does not check that the bid belongs to that load and transporter. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L77](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L77)
3. **Booking does not require a pending bid.** The selected bid's status is not checked before it is marked `ACCEPTED`; the only check is whether any accepted bid already exists for the load. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L68-L77](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L137-L139)
4. **The `BOOK` status validator is unused.** `LoadStatusValidator` defines a cancelled-load booking check, but `createBooking` never calls `validateStatusTransition(..., "BOOK")`. [src/main/java/com/harsha/tms/service/LoadStatusValidator.java#L25-L31](src/main/java/com/harsha/tms/service/LoadStatusValidator.java#L25-L31), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L105](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L105)
5. **Booking cancellation is not idempotent.** Repeating cancellation can add allocated trucks and load capacity again because current booking status is not checked. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L162-L190](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L162-L190)
6. **Load cancellation can coexist with active bookings.** Load cancellation blocks only status `BOOKED`; it does not inspect or cancel existing bookings. [src/main/java/com/harsha/tms/service/LoadStatusValidator.java#L18-L24](src/main/java/com/harsha/tms/service/LoadStatusValidator.java#L18-L24), [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L129-L138](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L129-L138)
7. **Truck update can delete inventory needed for cancellation.** The update operation deletes all truck rows before inserting the replacement list. [src/main/java/com/harsha/tms/service/impl/TransporterServiceImpl.java#L58-L68](src/main/java/com/harsha/tms/service/impl/TransporterServiceImpl.java#L58-L68)
8. **Bid and booking count duplicate truck types differently.** Bid submission sums all matching truck rows; booking stops at the first matching row. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L58-L67](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L81-L101)
9. **Filtered pagination can fail for an out-of-range page.** `subList(start, end)` is called without handling `start > loads.size()`. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L113-L126](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L113-L126)
10. **Important domain constraints are absent.** There is no cross-field check that delivery follows pickup, no rating range check, no nonnegative truck-count validation, and no check that allocated trucks do not exceed `bid.trucksOffered`. [src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L32-L49](src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L32-L49), [src/main/java/com/harsha/tms/dto/request/UpdateTrucksRequestDTO.java#L5-L14](src/main/java/com/harsha/tms/dto/request/UpdateTrucksRequestDTO.java#L5-L14), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L105](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L105)
11. **The bid unique constraint is broader than its name suggests.** It is unique on `(load_id, status)`, so it can prevent more than one pending bid for a load, not only more than one accepted bid. [src/main/java/com/harsha/tms/entity/Bid.java#L22-L38](src/main/java/com/harsha/tms/entity/Bid.java#L22-L38)
12. **Secrets are committed in runtime configuration.** The production properties file contains a database password, and the schema uses `ddl-auto=update` rather than a declared migration tool. [src/main/resources/application.properties#L3-L10](src/main/resources/application.properties#L3-L10), [pom.xml#L37-L73](pom.xml#L37-L73)
13. **Test coverage does not exercise the HTTP/security boundary.** Tests are mainly Mockito service tests plus context and enum tests. [src/test/java/com/harsha/tms/service/BookingServiceImplTest.java#L41-L47](src/test/java/com/harsha/tms/service/BookingServiceImplTest.java#L41-L47), [src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L5-L12](src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L5-L12)

## 11. Measurable facts

These counts are derived from the checked-in source tree, not runtime telemetry:

- **15 HTTP endpoints:** 5 load, 4 bid, 3 booking, and 3 transporter endpoints. [src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68](src/main/java/com/harsha/tms/controller/LoadController.java#L25-L68), [src/main/java/com/harsha/tms/controller/BidController.java#L22-L58](src/main/java/com/harsha/tms/controller/BidController.java#L22-L58), [src/main/java/com/harsha/tms/controller/BookingController.java#L18-L45](src/main/java/com/harsha/tms/controller/BookingController.java#L18-L45), [src/main/java/com/harsha/tms/controller/TransporterController.java#L18-L47](src/main/java/com/harsha/tms/controller/TransporterController.java#L18-L47)
- **5 persisted entity classes:** `Load`, `Bid`, `Booking`, `Transporter`, and `Truck`. [src/main/java/com/harsha/tms/entity/Load.java#L19-L20](src/main/java/com/harsha/tms/entity/Load.java#L19-L20), [src/main/java/com/harsha/tms/entity/Bid.java#L29-L30](src/main/java/com/harsha/tms/entity/Bid.java#L29-L30), [src/main/java/com/harsha/tms/entity/Booking.java#L21-L22](src/main/java/com/harsha/tms/entity/Booking.java#L21-L22), [src/main/java/com/harsha/tms/entity/Transporter.java#L14-L15](src/main/java/com/harsha/tms/entity/Transporter.java#L14-L15), [src/main/java/com/harsha/tms/entity/Truck.java#L12-L13](src/main/java/com/harsha/tms/entity/Truck.java#L12-L13)
- **3 domain enums:** `BookingStatus` has 7 values, `BidStatus` has 3, and `WeightUnit` has 2. [src/main/java/com/harsha/tms/entity/BookingStatus.java#L3-L11](src/main/java/com/harsha/tms/entity/BookingStatus.java#L3-L11), [src/main/java/com/harsha/tms/entity/BidStatus.java#L3-L7](src/main/java/com/harsha/tms/entity/BidStatus.java#L3-L7), [src/main/java/com/harsha/tms/entity/WeightUnit.java#L3-L6](src/main/java/com/harsha/tms/entity/WeightUnit.java#L3-L6)
- **4 controllers and 4 service implementations.** [src/main/java/com/harsha/tms/controller](src/main/java/com/harsha/tms/controller), [src/main/java/com/harsha/tms/service/impl](src/main/java/com/harsha/tms/service/impl)
- **2 explicit domain participant types:** shipper is represented only by a UUID field, and transporter is a persisted entity. Any additional operator role is `INFERRED`, not modeled. [src/main/java/com/harsha/tms/entity/Load.java#L43-L52](src/main/java/com/harsha/tms/entity/Load.java#L43-L52), [src/main/java/com/harsha/tms/entity/Transporter.java#L14-L25](src/main/java/com/harsha/tms/entity/Transporter.java#L14-L25)
- **0 frontend pages proven by this repository.** Frontend count is `UNKNOWN` outside this repository.
- **6 test classes.** [src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L1-L12](src/test/java/com/harsha/tms/TransportManagementSystemApplicationTests.java#L1-L12), [src/test/java/com/harsha/tms/service](src/test/java/com/harsha/tms/service), [src/test/java/com/harsha/tms/entity/WeightUnitTest.java#L1-L22](src/test/java/com/harsha/tms/entity/WeightUnitTest.java#L1-L22)
- **0 authentication roles implemented in code.** [pom.xml#L37-L73](pom.xml#L37-L73)

## 12. Interview prep

### Likely questions and short answers

1. **What does TMS stand for?** Transport Management System, based on the application/OpenAPI naming. [src/main/java/com/harsha/tms/config/OpenApiConfig.java#L15-L24](src/main/java/com/harsha/tms/config/OpenApiConfig.java#L15-L24)
2. **What architecture is used?** A layered Spring application: controllers call services, services call Spring Data repositories, and repositories persist JPA entities. [src/main/java/com/harsha/tms/controller/LoadController.java#L25-L34](src/main/java/com/harsha/tms/controller/LoadController.java#L25-L34), [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L25-L38](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L25-L38)
3. **What happens when a load is created?** Request fields are copied, remaining capacity is initialized, status becomes `POSTED`, UTC posting time is set, and the load is saved. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L39-L69](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L39-L69)
4. **How does a load become open for bids?** The first submitted bid changes `POSTED` to `OPEN_FOR_BIDS`. [src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L72-L76](src/main/java/com/harsha/tms/service/impl/BidServiceImpl.java#L72-L76)
5. **How are best bids ranked?** Score is `0.7 * reciprocal proposed rate + 0.3 * normalized transporter rating`, sorted descending. [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L169-L175](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L169-L175)
6. **How is capacity protected during booking?** The service checks remaining load trucks and matching transporter inventory before decrementing both. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L124](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L79-L124)
7. **How is concurrent booking handled?** `Load` has a JPA `@Version`; an optimistic-lock failure is translated to a conflict exception. [src/main/java/com/harsha/tms/entity/Load.java#L31-L35](src/main/java/com/harsha/tms/entity/Load.java#L31-L35), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L146-L149)
8. **What is the role of `@Transactional`?** Service operations that mutate related records are transactional, such as booking and cancellation, so their repository operations execute within one transaction boundary. [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L52-L53](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L52-L53), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L161-L162](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L161-L162)
9. **How does validation work?** DTO Bean Validation annotations are activated by controller `@Valid`; the global handler turns binding errors into HTTP 400. [src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L11-L49](src/main/java/com/harsha/tms/dto/request/LoadRequestDTO.java#L11-L49), [src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L43-L60](src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L43-L60)
10. **What database is used?** PostgreSQL at runtime and H2 for tests. [src/main/resources/application.properties#L3-L10](src/main/resources/application.properties#L3-L10), [src/test/resources/application.properties#L3-L14](src/test/resources/application.properties#L3-L14)
11. **Is there authentication?** Not in this codebase; there is no security dependency/configuration or authorization check. [pom.xml#L37-L73](pom.xml#L37-L73)
12. **How are truck inventories represented?** A transporter has `Truck` rows keyed by truck type with an aggregate count. [src/main/java/com/harsha/tms/entity/Truck.java#L12-L35](src/main/java/com/harsha/tms/entity/Truck.java#L12-L35)
13. **What are the main statuses?** Loads/bookings share `BookingStatus`; bids use `BidStatus`. The enums include 7 load/booking values and 3 bid values. [src/main/java/com/harsha/tms/entity/BookingStatus.java#L3-L11](src/main/java/com/harsha/tms/entity/BookingStatus.java#L3-L11), [src/main/java/com/harsha/tms/entity/BidStatus.java#L3-L7](src/main/java/com/harsha/tms/entity/BidStatus.java#L3-L7)
14. **What would you improve first?** Add authentication/authorization and ownership checks, validate bid relationships/status before booking, make cancellation idempotent, and add API/concurrency tests. These gaps are visible in [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L105](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L105) and the test structure [src/test/java/com/harsha/tms](src/test/java/com/harsha/tms).
15. **How do you run tests?** Run `mvnw.cmd test` on Windows; Maven Surefire runs tests and JaCoCo is attached to the test phase. [pom.xml#L75-L115](pom.xml#L75-L115), [mvnw.cmd#L1-L1](mvnw.cmd#L1-L1)

### Concepts to understand before defending the project

Spring MVC request mapping and DTO binding; Bean Validation; layered architecture; dependency injection; Spring transactions; JPA entity relationships and lazy loading; repository-derived queries; optimistic locking; pagination; enum persistence; database constraints; idempotency; race conditions; authorization versus authentication; secret management; schema migrations; unit versus integration testing; and the implications of in-memory pagination and aggregate inventory updates.

## 13. Draft resume bullets

- Built a Spring Boot transport management backend that exposed load, bid, booking, and transporter APIs through layered controllers, services, and JPA repositories; implemented the core logistics workflow from load posting through capacity-backed booking.  
  Evidence: [src/main/java/com/harsha/tms/controller](src/main/java/com/harsha/tms/controller), [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L145](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L54-L145), [src/main/java/com/harsha/tms/repository](src/main/java/com/harsha/tms/repository)

- Implemented transactional booking allocation that validated remaining load capacity and truck-type inventory, updated both aggregates, and used JPA optimistic locking to report concurrent booking conflicts.  
  Evidence: [src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L52-L149](src/main/java/com/harsha/tms/service/impl/BookingServiceImpl.java#L52-L149), [src/main/java/com/harsha/tms/entity/Load.java#L31-L35](src/main/java/com/harsha/tms/entity/Load.java#L31-L35)

- Added bid evaluation that combined reciprocal proposed price with normalized transporter rating, then returned bids in descending score order for load selection.  
  Evidence: [src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L158-L184](src/main/java/com/harsha/tms/service/impl/LoadServiceImpl.java#L158-L184), [src/main/java/com/harsha/tms/service/ScoreWeights.java#L3-L13](src/main/java/com/harsha/tms/service/ScoreWeights.java#L3-L13)

- Added request validation, centralized exception-to-HTTP mapping, PostgreSQL/H2 configurations, and Mockito-based service tests covering successful, not-found, capacity, filtering, and inventory-update paths.  
  Evidence: [src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L17-L91](src/main/java/com/harsha/tms/exception/handler/GlobalExceptionHandler.java#L17-L91), [src/main/resources/application.properties#L1-L14](src/main/resources/application.properties#L1-L14), [src/test/java/com/harsha/tms/service](src/test/java/com/harsha/tms/service)

## 14. Questions for me

The repository cannot answer these questions:

1. Did you personally design, implement, test, or only inherit each module?
2. Was this deployed anywhere? If yes, where and with what deployment process?
3. Who were the real users, if any, and what were the actual shipper/transporter/operator workflows?
4. Was authentication intentionally out of scope, or is it unfinished?
5. What business requirement led to the price/rating weights of `0.7` and `0.3`?
6. Why is a shipper represented by a UUID instead of a persisted entity?
7. Why does a booking request accept both `bidId` and `transporterId` instead of deriving the transporter from the bid?
8. Was the `(load_id, status)` bid uniqueness constraint intentional, or was the intended constraint only one accepted bid per load?
9. What load and booking status transitions were intended for `IN_TRANSIT` and `COMPLETED`?
10. Were notifications, tracking, payments, maps, or carrier integrations planned but omitted?
11. What PostgreSQL version and hosting environment were actually used? The POM/properties do not establish a server version.
12. Were the committed database credentials test-only, local-only, or ever used outside development? They should be rotated if real.
13. Was the README generated for an earlier version? It describes files, statuses, paths, and versions that conflict with the implementation.
14. What performance or data-volume assumptions justified in-memory pagination for filtered loads?
15. Were concurrency tests run against a real database, or is optimistic locking only unit-tested indirectly?
16. What coverage percentage did JaCoCo produce for the final build? A committed report or reproducible command is not present.
17. Was there a separate frontend repository? This repository contains no frontend implementation.
18. What ownership, code-review, incident, and maintenance responsibilities did you have?
