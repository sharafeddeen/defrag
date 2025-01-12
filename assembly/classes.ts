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
 * This class encodes an entity along with 
 * the exact substring in the slack message 
 * related to that entity.
 */
export class EntityContentPair {
    entity!: string
    content!: string
}