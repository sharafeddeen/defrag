# defrag
defragment cross-platform communication for your team

## problem
- employees don't stick to one channel when they communicate about a single topic
- it becomes difficult to maintain context of the communication timeline 
- so we don't have a source of truth for communications re: that topic
## example
1. we found we could use a cheaper plan if we change config on a tool we use in our stack
2. manager assigns dev to make this change in thread A
3. at a later point, the manager assigns the dev to estimate our monthly spend across our entire stack in thread B
4. the dev updates the manager on both tasks in thread B
5. now the team has to remember that the update was shared in thread B
6. now imagine if we scale this to 2, 5, 10, etc. updates -> quickly becomes infeasible to keep track
## solution
- someone (or something) that takes care of organizing conversation updates & connecting them to their original topics
- enter defrag
## how does it work?
- we connect to an org's communication platforms
- monitor their conversations across platforms
- reorganize their chats in real-time 
- provide a platform where they can see all the topics they're involved in

## features

### link conversation threads across platforms
Whether it’s a Slack conversation, a Zoom call, or an email exchange, Defrag links everything, so you always know where a discussion left off.

### your internal search engine
Filter by participants, keywords, or timelines to locate critical conversations without the frustration of endless scrolling.

## demo instructions
connect to `https://defrag-defrag.hypermode.app/graphql` via your GraphQL client

you will notice 3 different functions you can invoke

`channel_a` and `channel_b` are meant to give you the experience of 2 different slack channels you can communciate through (I didn't have time to implement the actual slack integration, but this will function roughly the same with the actual integration)

what defrag does is take messages across these channels & reorganize them on the backend to assign them to the correct topic

note that since this KG is custom to the user (organization), you will need to populate the graph with some mock conversations, which you can then search over

### populate the graph
enter your name & the message
![image](https://github.com/user-attachments/assets/c33ba335-f893-4b42-a15c-9f346a411e0c)
### search
use `search_kg` with any question you have around the graph
internally this is the logic:
1. llm takes your input & generates a cypher query to search the graph for context (potentially multi-hop search if it needs to)
2. I pass your input & the KG context to a second llm call
3. what you see in the output is the result of that second call

### snippet from the KG
![image](https://github.com/user-attachments/assets/9504a170-e5cf-4ccd-861a-0549bb29de2c)

## stack
- **Neo4j** as a graph db. The reason a graphdb is good for this project is that we need to handle arbitrary search queries from the user, so we need to do query rewriting with an LLM, and relational query rewriting can get pretty complex, but Cypher is simple enough that it guarantees the LLM stays accurate when generating a complex/multi-hop query.
- **Modus** as the development framework. The idea behind modus is cool in the sense that they are a high-performance web framework. Think about the needs of our app: we need to handle KG-update & search by multiple simultaneous users across multiple potential organizations. Modus makes it pretty fast to do so, which enables us to do KG search in near-real-time after an insertion at scale!
- **Hypermode** for IaaS. I gotta say, coming from a GCP background, it was damn easy to set this one up!
