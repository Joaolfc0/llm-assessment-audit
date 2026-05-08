/**
 * AEA: Architectural Evaluation Audit
 * Data Module - Contains all evaluation data
 */

// Project Description
const PROJECT_DESCRIPTION = `GeoServer Cloud

GeoServer is an open-source server for sharing and editing geospatial data from any major spatial data source using open standards.

GeoServer Cloud builds on GeoServer to provide a Cloud Native distribution of its geospatial services and APIs.

Hexagons represent microservices.

Colored rectangles represent logical groupings of components.

Lines connecting a group to another component indicate that the connector applies to all services of the outgoing end and to all components of the incoming end.

White rectangles represent components that are platform/deployment choices. For example:
• "Event bus" could be a cloud infrastructure provider's native service (event queue) or a microservice implementing a distributed event broker.
• "Catalog/Config backend" is the software component used to access the catalog and configuration. It might be a microservice itself, a catalog/config provider for a "data directory", a database, or another external service store, depending on the available catalog/config backend implementations and how they're configured and provisioned.
• "Catalog/Config storage" is the storage mechanism that backs the catalog/config software component. It might a shared "data directory" or database, a "per instance" data directory or database, and so on, depending on the available catalog/config backend implementations, and how they're configured and provisioned.
• "Geospatial data sources" is whatever method is used to access the actual data served up by the microservices.`;

// Criteria Definitions
const CRITERIA = {
    accuracy: {
        name: "Accuracy (Precisão)",
        description: "Accuracy is about whether the diagram correctly reflects the architecture described in the text, including components, interactions, and technologies.",
        guidelines: [
            {
                id: "component_matching",
                name: "Component Matching",
                description: "Do the components and characteristics in the diagram correspond to the components and characteristics described in the text, with compatible names, roles, colors and responsibilities?"
            },
            {
                id: "interaction_matching",
                name: "Interaction Matching",
                description: "Do the interactions in the diagram (calls, messages, data flows) match the interactions described in the text in terms of direction, main participants, and purpose?"
            }
        ]
    },
    clarity: {
        name: "Clarity (Clareza)",
        description: "Clarity is about how easily a reader (technical or semi-technical) can understand the architecture from the diagram and its description.",
        guidelines: [
            {
                id: "element_identification",
                name: "Element Identification",
                description: "Are ALL relevant elements (services, databases, queues, external actors, etc.) clearly labeled with meaningful names?"
            },
            {
                id: "reading_flow",
                name: "Reading Flow",
                description: "Is there an implicit or explicit starting point and progression for reading the diagram? Is the main flow of requests/events understandable?"
            },
            {
                id: "symbol_label_readability",
                name: "Symbol and Label Readability",
                description: "Are the symbols, labels, and connections visually clear (no excessive clutter, overlapping arrows, unreadable text)? Are the elements of the diagram clearly identified?"
            },
            {
                id: "specific_symbology",
                name: "Specific Symbology",
                description: "Does the diagram adopts symbols for specific technologies if the system uses those technologies?"
            }
        ]
    },
    completeness: {
        name: "Completeness (Completude)",
        description: "Completeness is about whether the diagram includes the main architectural elements and interactions needed to understand the system as a whole.",
        guidelines: [
            {
                id: "coverage_main_components",
                name: "Coverage of Main Components",
                description: "Are all major components mentioned in the description (e.g., microservices, databases, message brokers, external systems) represented in the diagram?"
            },
            {
                id: "external_actors_coverage",
                name: "External Actors Coverage",
                description: "Are relevant external actors (users, external APIs, third-party systems) shown when they are important to understanding how the system works end-to-end?"
            },
            {
                id: "main_interactions_coverage",
                name: "Main Interactions Coverage",
                description: "Are the primary interactions between components (requests, messages, events) represented so that the overall behavior of the system can be understood?"
            }
        ]
    },
    consistency: {
        name: "Consistency (Consistência)",
        description: "Consistency is about whether the diagram uses a clearly defined notation and applies it uniformly, and whether it consistently represents specific technologies.",
        guidelines: [
            {
                id: "notation_uniformity",
                name: "Notation Definition and Uniformity",
                description: "Does the diagram use a clear notation for different types of elements (services, databases, communication channels, external actors) and apply it consistently?"
            },
            {
                id: "technology_symbols",
                name: "Technology Symbols",
                description: "Are technology symbols used consistently throughout the diagram?"
            },
            {
                id: "naming_consistency",
                name: "Naming and Representation Consistency",
                description: "Are similar elements named and represented consistently across the diagram and description (no conflicting names or mixed styles for the same type of element)?"
            }
        ]
    },
    level_of_detail: {
        name: "Level of Detail (Nível de Detalhe)",
        description: "Level of detail is about whether the elements of the diagram are presented with an appropriate amount of detail for understanding the architecture. The primary audience is software developers and architects.",
        guidelines: [
            {
                id: "element_detail",
                name: "Element Detail",
                description: "Are components described with enough information (names, roles, responsibilities, grouping, colors) to understand what they do?"
            },
            {
                id: "interaction_detail",
                name: "Interaction Detail",
                description: "Are interactions shown with sufficient detail (direction and type of communication, such as request/response or messaging) to understand how the system behaves?"
            },
            {
                id: "overall_appropriateness",
                name: "Overall Appropriateness for Developers and Architects",
                description: "Considering developers and architects as the audience, is the level of detail balanced (neither too superficial nor excessively detailed for the architectural view)?"
            }
        ]
    }
};

// All 20 Outputs (4 combinations x 5 criteria)
const OUTPUTS = [
    // ===== ChatGPT PNG =====
    {
        id: "OUT_001",
        model: "ChatGPT",
        format: "PNG",
        criterion: "accuracy",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "component_matching",
                score: "4 (Excellent)",
                justification: "The diagram uses hexagons for microservices, colored rectangles for logical groupings (Front services, GeoServer, Infrastructure, External Data Sources), and white rectangles for platform/deployment choices (Event Bus, Catalog/Config back-end, Catalog/Config storage, Geospatial data sources) exactly as described. Named components align with GeoServer Cloud (WMS/WFS/WCS/WPS/REST/GWC/Web UI, Gateway, Discovery, Config) and the optional infrastructure (Monitoring, Logging, Tracing, Cache). Relationships like “Catalog/Config back-end” and its storage are represented consistently with the text’s explanation of alternatives."
            },
            {
                id: "interaction_matching",
                score: "3 (Good)",
                justification: "Key flows match the description: all GeoServer services connect to the catalog/config back-end and to geospatial data sources; services interact via an event bus with infrastructure (Discovery/Config), and the group-to-component convention is observed. Minor ambiguities reduce clarity: the Gateway is shown routing only to a subset of services (not obviously to WMS/WCS/REST), the coexistence of a “Config” microservice and a “Catalog/Config back-end” could be misread as two separate active components rather than alternative implementations, and optional components (Monitoring/Logging/Tracing/Cache) lack explicit interaction arrows. These are small issues; overall interactions remain consistent with the text."
            }
        ]
    },
    {
        id: "OUT_002",
        model: "ChatGPT",
        format: "PNG",
        criterion: "clarity",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "element_identification",
                score: "3 (Good)",
                justification: "Most core elements are labeled with meaningful names (Gateway, WFS/WMS/WCS/WPS/REST/GWC/Web UI, Discovery, Config, Event Bus, Catalog/Config back-end and storage, Geospatial data sources, Monitoring, Logging/Tracing/Cache). Logical groupings (Front services, GeoServer, Infrastructure, External Data Sources) are clear and cardinality [0..N] is explicit. Missing/ambiguous items reduce completeness: no explicit external client/consumer, security/auth components aren't shown, and Monitoring/Logging/Tracing/Cache appear without clear interaction lines."
            },
            {
                id: "reading_flow",
                score: "3 (Good)",
                justification: "A likely entry point (Gateway) fans into the microservices, which in turn point to data sources and interact with Config/Discovery via the Event Bus—so the main intent is discernible. However, there's no explicit \"user → gateway\" start, some bidirectional arrows around Discovery/Config/Event Bus are hard to interpret, and the rule \"group-to-group link applies to all\" must be learned from the description to fully grasp flows."
            },
            {
                id: "symbol_label_readability",
                score: "3 (Good)",
                justification: "Shapes, colors, and labels are legible; group boundaries are distinct; cardinality annotations help. Minor issues: several connectors cross, the double boundary inside GeoServer can be visually confusing, the wavy connector is nonstandard, and some optional components (dashed boxes) lack connecting lines, creating uncertainty."
            },
            {
                id: "specific_symbology",
                score: "3 (Good)",
                justification: "Consistent generic symbology (hexagons for microservices, white rectangles for platform choices, dashed boxes for optional) supports clarity without overcommitting to a technology. If concrete technologies are known (e.g., Kafka for Event Bus, Consul/Eureka for Discovery, Prometheus/Grafana for Monitoring), using those symbols or labels would further improve specificity."
            }
        ]
    },
    {
        id: "OUT_003",
        model: "ChatGPT",
        format: "PNG",
        criterion: "completeness",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "coverage_main_components",
                score: "4 (Excellent)",
                justification: "Diagram includes the gateway, all core GeoServer microservices (WMS/WFS/WCS/WPS/REST/GWC/Web UI) with scaling hints, infrastructure services (Discovery, Config), event bus, platform choices (Monitoring, Logging, Tracing, Cache), and data/persistence layers (Catalog/Config back-end and storage, Geospatial data sources). These cover the major elements described."
            },
            {
                id: "external_actors_coverage",
                score: "2 (Fair)",
                justification: "External data sources are shown, but client actors/consumers (apps, users), administrators/operators, and identity providers are not depicted. System boundary (internet/ingress) is also unspecified, limiting end-to-end understanding."
            },
            {
                id: "main_interactions_coverage",
                score: "3 (Good)",
                justification: "Key flows are visible—gateway routing to services, services using catalog/config back-end and geospatial data sources, and event-bus interactions with Discovery/Config. However, interaction types/directions are partly implicit, and important flows (authN/Z, monitoring/logging data paths, admin/config lifecycle, inter-service calls such as Web UI -> REST) are not shown."
            }
        ]
    },
    {
        id: "OUT_004",
        model: "ChatGPT",
        format: "PNG",
        criterion: "consistency",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "notation_uniformity",
                score: "3 (Good)",
                justification: "Clear mapping is stated and largely applied: hexagons for microservices, colored areas for logical groupings, white rectangles for platform/deployment choices, and group-to-component connectors for fan-out. Consistency gaps: dashed group borders (e.g., Monitoring; Logging/Tracing/Cache) are not explained; the Event Bus is shown as a green vertical bar rather than a white \"platform choice\" block as described; a wavy connector appears without defined meaning. Arrow directions are mostly clear but occasionally ambiguous."
            },
            {
                id: "technology_symbols",
                score: "2 (Fair)",
                justification: "Mixed symbol usage: some hexagons include specific icons (Gateway, Logging, Tracing, Cache) while most service hexagons are plain, creating uneven semantics. The Gateway icon suggests a specific product; the Event Bus is modeled as a channel, conflicting with the text that treats it as a deployment-choice component. No consistent notation for sync vs. async messaging (only an undefined wavy line appears)."
            },
            {
                id: "naming_consistency",
                score: "3 (Good)",
                justification: "Service names are consistent and the [0..N] multiplicity is applied uniformly. Group labels (GeoServer, Infrastructure, External Data Sources, Front services) are consistent. Minor issues: \"back-end\" vs \"backend\" spelling varies; \"Config\" is used both as a microservice name and within \"Catalog/Config,\" which can blur distinctions; Gateway connects to a subset of services without an explicit rule, which can be read as inconsistent with the fan-out convention."
            }
        ]
    },
    {
        id: "OUT_005",
        model: "ChatGPT",
        format: "PNG",
        criterion: "level_of_detail",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "element_detail",
                score: "3 (Good)",
                justification: "Services are clearly named and grouped (Front services, GeoServer, Infrastructure, Event Bus, External Data Sources), shapes/colors convey types, and cardinality [0..N] indicates scalability. However, specific responsibilities are mostly inferred from names (e.g., WMS/WFS), acronyms aren't expanded, and roles of infra pieces (Discovery, Config, Monitoring/Logging/Tracing/Cache) are not explicitly described."
            },
            {
                id: "interaction_detail",
                score: "2 (Fair)",
                justification: "Arrows indicate direction and group-to-component connectors clarify fan-in/fan-out; flows to catalog/config backend, storage, and geospatial data sources are shown; an event bus is depicted. Missing are communication styles/protocols (HTTP/gRPC/OGC), sync vs async semantics, who publishes/subscribes and on which topics, auth/edge concerns at the gateway, and explicit interactions with monitoring/logging/tracing/cache. No sequencing or error/health flows are indicated."
            },
            {
                id: "overall_appropriateness",
                score: "3 (Good)",
                justification: "Provides a solid high-level map of microservices and external dependencies suitable for architectural discussions and capacity planning, but lacks enough interaction semantics and operational detail for developers to reason about behavior and integration without supplementary documentation."
            }
        ]
    },
    // ===== ChatGPT SVG =====
    {
        id: "OUT_006",
        model: "ChatGPT",
        format: "SVG",
        criterion: "accuracy",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "component_matching",
                score: "3 (Good)",
                justification: "The diagram largely follows the stated conventions: hexagons are used for microservices, colored rectangles group components, and there are clear groupings for GeoServer Cloud services and platform/deployment elements. However, several platform/deployment choices cited in the description (e.g., Event bus, Catalog/Config backend, Catalog/Config storage, Geospatial data sources) are rendered as blue diamond-like nodes rather than white rectangles as specified, creating a notation mismatch. Despite that, their placement and implied roles align with the description."
            },
            {
                id: "interaction_matching",
                score: "3 (Good)",
                justification: "The diagram depicts group-to-component connectors consistent with the description's rule (one connector applying to all services/components on each end). It shows expected interactions from microservices to an event bus, catalog/config backend/storage, and geospatial data sources, as well as client-to-service flows. The description is high level and does not prescribe detailed data-flow directions, so precise verification is limited, but nothing contradicts the stated interaction semantics."
            }
        ]
    },
    {
        id: "OUT_007",
        model: "ChatGPT",
        format: "SVG",
        criterion: "clarity",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "element_identification",
                score: "3 (Good)",
                justification: "Most components are present and named (microservices, groupings, platform/deployment choices). A legend clarifies hexagons vs rectangles and \"apply-to-all\" connectors. However, no explicit external client/actor is shown, some group labels are terse, and several \"choice\" components remain generic."
            },
            {
                id: "reading_flow",
                score: "3 (Good)",
                justification: "Arrows and group-to-group connectors convey relationships (services to event bus, config/catalog, data sources). Yet there's no clear entry point (e.g., user/API gateway), some connectors are bidirectional/implicit, and the top-to-bottom or left-to-right progression isn't obvious without referring to the legend."
            },
            {
                id: "symbol_label_readability",
                score: "3 (Good)",
                justification: "Distinct colors and shapes reduce ambiguity; labels are mostly legible and do not heavily overlap. Still, the diagram is dense, some labels are rotated/vertical, and small text and multiple connectors increase scanning effort."
            },
            {
                id: "specific_symbology",
                score: "3 (Good)",
                justification: "Consistent, explained symbology (hexagons for microservices, colored rectangles for groupings, white boxes for deployment choices). It remains tech‑agnostic; no vendor/technology-specific icons (e.g., Kafka, PostGIS) are used, which limits precision when concrete tech is known."
            }
        ]
    },
    {
        id: "OUT_008",
        model: "ChatGPT",
        format: "SVG",
        criterion: "completeness",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "coverage_main_components",
                score: "4 (Excellent)",
                justification: "The diagram includes the microservices (hexagons) within a clear logical grouping, platform/deployment choice components as white boxes (Event bus, Catalog/Config backend, Catalog/Config storage), geospatial data sources, and a side rail likely representing ingress/API gateway or service mesh. It also shows observability/devops sinks (logging/metrics/tracing) in the bottom band. These cover all major elements mentioned in the description."
            },
            {
                id: "external_actors_coverage",
                score: "3 (Good)",
                justification: "The top band depicts clients (e.g., web/desktop/CLI) and external data sources are shown. However, other common external actors relevant to end-to-end understanding (e.g., identity provider/SSO, admin/ops users, CDN/edge) are not explicitly depicted or labeled, so external context is present but not comprehensive."
            },
            {
                id: "main_interactions_coverage",
                score: "4 (Excellent)",
                justification: "Primary interactions are shown with fan-out/fan-in connectors from the microservices group to the event bus, catalog/config backend and its storage, geospatial data sources, and observability sinks. Client-to-service paths and the \"group-to-component applies to all\" rule make system behavior understandable at a high level. While detailed inter-service call patterns aren't shown, the essential flows for the architecture are covered."
            }
        ]
    },
    {
        id: "OUT_009",
        model: "ChatGPT",
        format: "SVG",
        criterion: "consistency",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "notation_uniformity",
                score: "2 (Fair)",
                justification: "The legend/description clearly defines the notation (hexagons = microservices, colored rectangles = logical groupings, white rectangles = platform/deployment choices, group-to-component connectors apply to all). The diagram mostly respects group boundaries and uses consistent connector/arrow styling. However, several elements that the legend says should be white rectangles (e.g., Event bus, Catalog/Config backend, Catalog/Config storage, Geospatial data sources) appear as blue hexagons within the right-hand grouping, conflicting with the stated notation. Hexagons also appear in two different blue shades without an explained semantic difference. These weaken uniformity."
            },
            {
                id: "technology_symbols",
                score: "3 (Good)",
                justification: "Technologies are represented generically (no vendor logos or conflicting icons), and categories like event bus, catalog/config, and data sources are kept abstract, which avoids mixed technology styles. Iconography inside hexagons (e.g., file/database-like pictograms) is used consistently as decoration but lacks a legend; the two different hexagon color tones are not explained, introducing minor ambiguity."
            },
            {
                id: "naming_consistency",
                score: "3 (Good)",
                justification: "Naming appears consistent for similar concepts (e.g., distinct, stable terms like \"Catalog/Config backend\" vs \"Catalog/Config storage,\" \"Event bus,\" \"Geospatial data sources,\" and service types). Logical group labels and cross-cutting planes are applied coherently. The main inconsistency is representational (shape misuse for platform choices), already reflected under notation; textual naming itself does not conflict."
            }
        ]
    },
    {
        id: "OUT_010",
        model: "ChatGPT",
        format: "SVG",
        criterion: "level_of_detail",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "element_detail",
                score: "3 (Good)",
                justification: "Clear visual legend: hexagons = microservices, colored rectangles = logical groupings, white rectangles = platform/deployment choices. Control-plane vs data-plane separation is explicit, and external dependencies (event bus, catalog/config backend and storage, geospatial data sources) are identified. However, most microservices are only named, with little role/responsibility description on the diagram itself; cardinality/tenancy nuances for backends are described in text, not visually encoded."
            },
            {
                id: "interaction_detail",
                score: "2 (Fair)",
                justification: "Directional arrows exist and there is a useful \"applies-to-all-services/components\" connector rule. Interaction types (sync vs async, API vs messaging) are largely implicit (e.g., via \"event bus\") and not annotated; protocols, message topics, and key flows between specific services are not shown. Internal service-to-service interactions are mostly abstracted, limiting behavioral understanding for developers."
            },
            {
                id: "overall_appropriateness",
                score: "3 (Good)",
                justification: "Suitable high-level view for understanding the service landscape, groupings, and external dependencies; balanced enough for an architectural overview. To be exemplary for developers/architects, it would need richer interaction semantics (communication patterns, key request flows, eventing patterns) and brief role notes per microservice."
            }
        ]
    },
    // ===== Gemini PNG =====
    {
        id: "OUT_011",
        model: "Gemini",
        format: "PNG",
        criterion: "accuracy",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "component_matching",
                score: "4 (Excellent)",
                justification: "The diagram strictly adheres to the visual language defined in the text. Hexagons are correctly used for microservices (e.g., WFS, WMS, Discovery), colored rectangles clearly demarcate logical groupings (e.g., Front services, GeoServer, Infrastructure), and white rectangles represent platform/deployment choices (e.g., Catalog/Config back-end and storage), exactly as the description specifies."
            },
            {
                id: "interaction_matching",
                score: "4 (Excellent)",
                justification: "The interactions perfectly reflect the rules and relationships described in the text. Notably, the diagram correctly applies the rule that lines connecting a group (the blue \"GeoServer\" box) to another component (like the \"Event Bus\" or \"Catalog/Config back-end\") apply to all services within that group. Furthermore, the hierarchical flow from the \"Catalog/Config back-end\" to the \"Catalog/Config storage\" is accurately depicted as described."
            }
        ]
    },
    {
        id: "OUT_012",
        model: "Gemini",
        format: "PNG",
        criterion: "clarity",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "element_identification",
                score: "4 (Excellent)",
                justification: "Every component is clearly labeled with text (e.g., \"Gateway,\" \"WFS,\" \"Discovery\"). Cardinality is explicitly noted on scalable services (e.g., \"[0..N]\"), and logical groupings (Front services, GeoServer, Infrastructure) are distinctly named. The distinction between microservices (hexagons) and external resources (white rectangles) is clear."
            },
            {
                id: "reading_flow",
                score: "4 (Excellent)",
                justification: "The diagram follows a logical top-down hierarchy. It starts at the \"Front services\" (Gateway), flows down into the core business logic (\"GeoServer\" cluster), and concludes at the data persistence layer at the bottom. Support services (Infrastructure) are positioned to the side, maintaining a clean separation between the request path and operational support components."
            },
            {
                id: "symbol_label_readability",
                score: "4 (Excellent)",
                justification: "The diagram effectively minimizes clutter by using the bounding boxes of groups to manage connections (e.g., the line from the \"GeoServer\" box to the \"Event Bus\" implies all contained services connect there, as noted in the description). This prevents a \"spaghetti\" effect of individual lines. Text contrast is high, and the layout is well-spaced."
            },
            {
                id: "specific_symbology",
                score: "3 (Good)",
                justification: "The diagram utilizes recognizable iconography from the Google Cloud Platform (GCP) set (e.g., the Load Balancing icon for Gateway, Operations icons for Logging/Monitoring) to represent functional roles. While this clearly communicates the *type* of service intended, it might slightly confuse a reader regarding whether the architecture is strictly tied to GCP or if these are just representative icons for generic capabilities."
            }
        ]
    },
    {
        id: "OUT_013",
        model: "Gemini",
        format: "PNG",
        criterion: "completeness",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "coverage_main_components",
                score: "4 (Excellent)",
                justification: "The diagram is highly comprehensive and perfectly matches the provided description. It explicitly visualizes the distinct groups mentioned (Front services, GeoServer microservices, Infrastructure, and External Data Sources). It includes specific implementation choices discussed in the text, such as the \"Event Bus,\" \"Catalog/Config back-end,\" \"Catalog/Config storage,\" and the various specific microservices (WFS, WMS, etc.)."
            },
            {
                id: "external_actors_coverage",
                score: "3 (Good)",
                justification: "The diagram effectively illustrates downstream external dependencies, specifically the \"Geospatial data sources\" and \"Catalog/Config storage\" which are critical for a GIS system. However, it lacks an explicit representation of upstream actors (Users, Client Applications, or 3rd Party APIs) triggering the \"Gateway.\" While the Gateway implies external access, explicit actor nodes would complete the end-to-end picture."
            },
            {
                id: "main_interactions_coverage",
                score: "4 (Excellent)",
                justification: "The flow of data and control is clearly mapped. The diagram shows the request routing from the Gateway to specific services, the dependency on backend storage, and the coordination via the \"Event Bus.\" The use of group-level connectors (explained in the description) efficiently conveys that all microservices within the \"GeoServer\" block interact with the Event Bus and Data Sources without cluttering the visual space with individual lines."
            }
        ]
    },
    {
        id: "OUT_014",
        model: "Gemini",
        format: "PNG",
        criterion: "consistency",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "notation_uniformity",
                score: "3 (Good)",
                justification: "The diagram follows the provided description closely, specifically regarding the use of hexagons for microservices, colored rectangles for groups, and the specific notation for lines connecting groups (applying to all enclosed services). However, the diagram includes dashed-line boxes (grouping Monitoring, and grouping Logging/Tracing/Cache) which represent a distinct type of grouping not defined in the provided description text."
            },
            {
                id: "technology_symbols",
                score: "4 (Excellent)",
                justification: "The diagram applies a clear and consistent visual distinction between core business logic services (text-only hexagons like WFS, WMS) and infrastructure/support services (hexagons with standard icons like Gateway, Monitoring). The icons used are standard and legible, reinforcing the function of the components without clutter."
            },
            {
                id: "naming_consistency",
                score: "4 (Excellent)",
                justification: "The naming conventions are highly consistent between the description and the diagram labels. Specific terms defined in the text, such as \"Catalog/Config back-end,\" \"Event Bus,\" and \"Geospatial data sources,\" appear in the diagram with the exact same terminology and the visual representation described (white rectangles for platform choices)."
            }
        ]
    },
    {
        id: "OUT_015",
        model: "Gemini",
        format: "PNG",
        criterion: "level_of_detail",
        diagramPath: "assets/gs_cloud_architecture_diagram.png",
        guidelines: [
            {
                id: "element_detail",
                score: "4 (Excellent)",
                justification: "The diagram uses specific, domain-relevant naming conventions (WFS, WMS, GWC) that immediately inform the target audience of the distinct microservice responsibilities. The use of the `[0..N]` notation provides crucial architectural information regarding the scalability of specific components. The visual distinction between business logic services (hexagons), infrastructure components (white rectangles), and logical groupings (colored containers) effectively communicates the system topology."
            },
            {
                id: "interaction_detail",
                score: "3 (Good)",
                justification: "The lines and arrows clearly establish dependencies and data flow direction (e.g., Gateway routing to services, services accessing storage). The use of group-level connections (lines connecting the \"GeoServer\" container to the \"Event Bus\" or \"Data Sources\") is an efficient way to reduce visual clutter while indicating that all internal components share these dependencies. However, specific protocols (e.g., HTTP vs. gRPC, specific messaging protocols) are implied rather than explicitly labeled."
            },
            {
                id: "overall_appropriateness",
                score: "4 (Excellent)",
                justification: "The diagram strikes an ideal balance for a logical architecture view. It abstracts away specific technology choices (e.g., specific database vendors or message brokers) to focus on the structural design and component relationships, which is exactly what architects need to understand the system's cloud-native distribution strategy. It provides enough technical depth (scaling, caching, discovery, logging) to be actionable without overwhelming the viewer with implementation minutiae."
            }
        ]
    },
    // ===== Gemini SVG =====
    {
        id: "OUT_016",
        model: "Gemini",
        format: "SVG",
        criterion: "accuracy",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "component_matching",
                score: "4 (Excellent)",
                justification: "The diagram follows the specific visual vocabulary defined in the description with high precision. Hexagons are used for microservices (WMS, WFS, etc.), colored rectangles are used for grouping, and white rectangles are used for platform choices (Event bus, Catalog backend), exactly as stated. The specific labels and examples (e.g., RabbitMQ, JDBC) match the context provided."
            },
            {
                id: "interaction_matching",
                score: "4 (Excellent)",
                justification: "The diagram accurately implements the connectivity logic described in the text. The lines connecting the \"Microservices\" group container to the \"Event bus,\" \"Catalog/Config backend,\" and \"Geospatial data sources\" correctly represent that these connections apply to all services within the group, adhering to the rule provided in the description. The structural relationships (e.g., Backend using Storage) are also correctly depicted."
            }
        ]
    },
    {
        id: "OUT_017",
        model: "Gemini",
        format: "SVG",
        criterion: "clarity",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "element_identification",
                score: "4 (Excellent)",
                justification: "Every component in the diagram is clearly labeled with standard domain terminology (e.g., WMS, WFS, Gateway). The distinction between microservices (colored icons) and infrastructure abstractions (white/yellow boxes like \"Event Bus\" or \"Catalog/Config storage\") is explicitly clear and well-aligned with the provided description."
            },
            {
                id: "reading_flow",
                score: "4 (Excellent)",
                justification: "The diagram exhibits a logical hierarchical flow. The \"Gateway\" on the left serves as a clear entry point, leading into the core services cluster in the center. The dependency on infrastructure (Event Bus, Config, Data Sources) is visually placed at the bottom, creating a natural top-down or outer-inner reading path. The use of lines connecting *groups* to components (rather than individual lines from every service) drastically simplifies the mental model of the connections."
            },
            {
                id: "symbol_label_readability",
                score: "4 (Excellent)",
                justification: "The visual clarity is high. The use of colored containers (groupings) effectively segments the architecture into logical areas (Ingress, Core Services, Admin, Storage). Text is high-contrast and legible. The decision to connect the \"Core Services\" group to the \"Event Bus\" with a single line is a strong architectural choice that avoids the \"spiderweb\" clutter often found in microservices diagrams."
            },
            {
                id: "specific_symbology",
                score: "3 (Good)",
                justification: "The diagram uses semantic, intuitive icons (e.g., maps for geospatial services, a cylinder for storage, a shield for security) which helps instant recognition of function. Since the architecture description emphasizes that components like the \"Event bus\" are deployment choices (platform-agnostic), the diagram correctly avoids using specific technology logos (like RabbitMQ or AWS SQS) in favor of generic architectural symbols."
            }
        ]
    },
    {
        id: "OUT_018",
        model: "Gemini",
        format: "SVG",
        criterion: "completeness",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "coverage_main_components",
                score: "4 (Excellent)",
                justification: "The diagram is highly detailed and fully aligns with the provided description. It explicitly represents all core functional microservices (WMS, WFS, WCS, WPS, etc.) rather than abstracting them into a single block. It also clearly depicts all supporting infrastructure components mentioned in the text, such as the Event Bus, Catalog/Config Backend, Storage, and Geospatial Data Sources."
            },
            {
                id: "external_actors_coverage",
                score: "3 (Good)",
                justification: "The diagram clearly identifies the system boundary via the \"Gateway\" and \"UI\" components, which serve as the entry points for external traffic. However, it does not explicitly visualize the external actors themselves (e.g., GIS Clients, Web Browsers, or 3rd party APIs) initiating the requests, which would provide slightly more context on the system's usage."
            },
            {
                id: "main_interactions_coverage",
                score: "4 (Excellent)",
                justification: "The diagram effectively uses logical groupings (colored rectangles) to depict interactions, as explained in the description. By connecting groups rather than individual components, it successfully communicates that all microservices interact with the Data Sources, Catalog Backend, and Event Bus without creating visual clutter (\"spaghetti\" lines). The flow from the Gateway to the services and then to the backend storage is logically clear."
            }
        ]
    },
    {
        id: "OUT_019",
        model: "Gemini",
        format: "SVG",
        criterion: "consistency",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "notation_uniformity",
                score: "4 (Excellent)",
                justification: "The diagram adheres strictly to the definitions provided in the description. Hexagons are exclusively used for microservices, colored rectangles for logical groupings, and white rectangles for infrastructure/platform choices. The notation regarding lines connecting to group boundaries (implying a connection to all components within) is applied rigorously to the Gateway, Event Bus, and Configuration connections, creating a very clean and logically consistent representation."
            },
            {
                id: "technology_symbols",
                score: "4 (Excellent)",
                justification: "The diagram uses standard architectural symbols (cylinders for storage, file icons for file systems) and domain-specific icons within the service hexagons (e.g., map layers for WMS) consistently. The visual style of the icons is uniform (monochromatic, simple line art), and no conflicting symbol sets (e.g., mixing vendor-specific logos with generic shapes) are present."
            },
            {
                id: "naming_consistency",
                score: "4 (Excellent)",
                justification: "Naming is perfectly consistent between the textual description and the diagram labels (e.g., \"Catalog/Config backend\" vs. \"Catalog/Config storage\"). The representation of similar elements is uniform; for instance, all OGC services (WMS, WFS, WCS) are treated as peers with identical shapes and styling. The distinction between the software component (white rectangle) and the backing storage (cylinder) for the Catalog/Config is handled consistently with the description."
            }
        ]
    },
    {
        id: "OUT_020",
        model: "Gemini",
        format: "SVG",
        criterion: "level_of_detail",
        diagramPath: "assets/gs_cloud_architecture_diagram.svg",
        guidelines: [
            {
                id: "element_detail",
                score: "4 (Excellent)",
                justification: "The diagram provides a high level of clarity regarding the system components. It explicitly names the specific technology stack for infrastructure components (Spring Cloud Gateway, Netflix Eureka, Spring Cloud Config) and uses standard domain acronyms for the microservices (WMS, WFS, WPS). The use of colored groupings to differentiate between \"Front Services,\" \"Back Services,\" and infrastructure effectively communicates the logical architecture. The text description supplements the visual elements perfectly by defining the abstraction level of the white boxes (Event Bus, Data Sources), giving architects exactly the information needed to understand where implementation flexibility exists."
            },
            {
                id: "interaction_detail",
                score: "3 (Good)",
                justification: "The interactions are clearly structured. The diagram distinguishes between North-South traffic (API Gateway to services) and East-West/Infrastructure traffic (Services to Event Bus, Config, and Discovery). The use of lines connecting *groups* to components (e.g., the Discovery Service bracket) is an excellent technique to reduce visual clutter while maintaining semantic accuracy (indicating all services register with Discovery). While explicit protocol labels (e.g., HTTP, AMQP, JDBC) are missing from the connecting lines, they are strongly implied by the named technologies (Spring Cloud implies HTTP/REST, Event Bus implies messaging)."
            },
            {
                id: "overall_appropriateness",
                score: "4 (Excellent)",
                justification: "The diagram strikes an ideal balance for the intended audience. It avoids the noise of code-level details while providing more substance than a high-level context view. It successfully communicates the \"Cloud Native\" strategy by highlighting the decomposition of the monolithic application into specific microservices and the introduction of necessary distributed system patterns (Gateway, Discovery, Config, Event Bus). This allows a developer or architect to immediately grasp the structural constraints and dependencies of the system."
            }
        ]
    }
];

const DIAGRAMS = [
    {
        id: "geoserver-cloud",
        title: "GeoServer Cloud",
        description: PROJECT_DESCRIPTION,
        imagePath: "assets/gs_cloud_architecture_diagram.png",
        textualPath: "assets/gs_cloud_architecture_diagram.svg",
        textualFormat: "SVG",
        outputIds: OUTPUTS.map(output => output.id)
    }
];

// Export for use in app.js
window.AEA_DATA = {
    description: PROJECT_DESCRIPTION,
    criteria: CRITERIA,
    diagrams: DIAGRAMS,
    outputs: OUTPUTS
};
