/**
 * A slack message may mention many entities.
 * This class encodes a topic along with 
 * the exact substring in the slack message 
 * related to that topic.
 */
@json // necessary to parse to this type
export class TopicContentPair {
    topic!: string;
    content!: string;

    constructor(topic: string, content: string) {
        this.topic = topic;
        this.content = content;
    }
}

@json
export class Person {
    name: string;
    sent!: Message[];
    constructor(name: string) {
        this.name = name;
    }
}

@json
export class Message {
    content: string;
    timestamp!: number;
    belongs_to!: Topic;
    embedding!: f32[][] | null;
    constructor(content: string) {
        this.content = content
    }
}

@json
export class Topic {
    name: string;
    embedding!: f32[][] | null;
    constructor(name: string) {
        this.name = name
    }
}

@json
export class NERWrapper {
    persons: null | Person[];
    messages: null | Message[];
    topics: null | Topic[];
    constructor (persons: Person[] | null = null, messages: Message[] | null = null, topics: Topic[] | null = null) {
        this.persons = persons
        this.messages = messages
        this.topics = topics
    }
}