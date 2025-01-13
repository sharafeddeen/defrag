// check out the docs here: https://api.slack.com/events/message.channels

@json
export class SlackChannelMessageEvent {
    type!: string
    channel!: string
    user!: string
    text!: string
    ts!: string
    event_ts!: string
    channel_type!: string
}

@json
export class SlackEventWrapper {
    token!: string
    team_id!: string
    api_app_id!: string
    event!: SlackChannelMessageEvent
    type!: string
    authed_teams!: string[]
    event_id!: string
    event_time!: string
}

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

export class Person {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}