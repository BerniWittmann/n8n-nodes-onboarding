# Script — Nodes team engineering onboarding

Speakable script for the practice recording. One section per slide; numbers match the deck.
Target: ~50 min of talk plus Q&A. Rough timings per part are in the headings of each section's first slide.
Fill in your name on slide 1 before recording.

## 1. Cover

Hi everyone, and welcome to the Nodes team onboarding.
I'm [Presenter: name], and I work on the Nodes team.
This session has two parts.
First, about ten minutes on who we are and what we own.
Then about forty minutes on how nodes actually work.
Ask questions any time. We also record this, so you can rewatch it later.

## 2. Agenda

Here are the six parts.
Part one is the team and our ecosystem.
Parts two to six are the engineering deep dive: how a node works, triggers, data flow, building nodes, and AI nodes.
Some things we skip on purpose, like testing and local dev. You get links to them at the end.

## 3. Team & ecosystem (~10 min)

Let's start with the team.

## 4. Integrations, everywhere

Our short version is this: wherever n8n connects to the outside world, that's us.
On the left is our official mission. It is about a healthy node ecosystem and a strong core node experience.
On the right is where we are heading: the Ecosystem domain.
Ecosystem is how n8n extends its reach. It connects to, abstracts, embeds and surfaces the services our users depend on.
Our part is the tools that agents and people use to get things done.

## 5. From Nodes to Ecosystem

For a long time, one team did every integration: first-party nodes, community nodes, and the AI Gateway.
As the domain grew, it split into three teams.
Community Engineering took community PRs, verified community nodes and managed OAuth credentials.
Relay took n8n Connect, the AI Gateway that lets users run services without their own credentials.
Nodes kept first-party nodes and credentials, and added the MCP registry, browser and computer use, and agent channels.
We still work closely together and share one bug backlog.
The idea behind the change: nodes were never the point. Reaching the tools our users live in was.

## 6. The ecosystem map

This map shows where our work sits.
On the left are the places where users build: canvas workflows, the AI Agent node, first-class Agents, and the n8n Assistant.
In the middle is what we build: integration nodes, the MCP registry, browser and computer use, and agent channels.
On the right is the outside world: APIs, databases, websites without an API, and people in chat apps.
One important point: the n8n Assistant still builds workflows out of our nodes.
So if the Assistant builds something broken, the cause is often a node.

## 7. What we own

This is what we own.
First-party nodes, like Slack and Google Sheets. There are more than four hundred built in.
Credentials, including OAuth flows and credential tests.
MCP: the registry, the MCP Client Tool and the MCP Server Trigger.
The Local Gateway, which is browser use and computer use.
And channels for first-class Agents.
The second row shows our neighbours, so you know where to send things.
Community nodes go to Community Engineering. Gateway credits go to Relay.
HTTP Request, Webhook and the execution engine belong to Catalysts. The Code node belongs to Adore.
For anything of ours, ask in #team-nodes. For code reviews, use #team-nodes-review.

## 8. MCP registry

The MCP registry is a curated list of official, remote MCP servers.
A background task keeps that list in sync.
Then a node loader turns each server into a tool node.
Users can then use those servers in the AI Agent node, in the n8n Assistant, and in first-class Agents.
Keep this in mind: a registry server is just a node description generated at run time.
You will see the same machinery in the next part.

## 9. Channels for agents

Channels let people talk to a first-class Agent where they already work.
Today that is Slack, Microsoft Teams, Telegram, Discord, Linear and n8n Chat.
We build on the Vercel Chat SDK, with one adapter per platform.
Each platform has its own setup, streaming and approval behaviour.
Approvals show up as cards, so a human can accept or reject a tool call.
More channels are in progress.

## 10. Browser use

Browser use lets an agent drive the user's real browser.
The agent talks to our MCP server, `@n8n/mcp-browser`.
That server talks to a Chrome extension, the n8n AI Browser Bridge.
The extension controls the user's real Chrome, with their own logins and cookies.
This is for the tasks no API covers, like old ERP forms or ad dashboards.
Our research shows people trust AI with their browser much more than with their whole computer.

## 11. The running example

Now the engineering part. First, our example. This is a real workflow in n8n.
A new email arrives in Gmail.
An IF node checks if the email is from a customer.
If yes, an AI Agent summarises it and looks up the customer in a Google Sheet.
Then Slack posts the summary to the support channel.
Every part of this workflow shows up again later.

## 12. How a node works (~8 min)

Let's look at how a node works.

## 13. A node = description + function

A node is two things: a description and a function.
The description is plain data: name, icon, inputs, outputs, credentials and parameters.
The editor draws the node settings panel, the NDV, only from that description.
When the workflow runs, the engine calls the node's function with the input items.
So nodes ship no UI code. A new node never touches the frontend.

## 14. Anatomy of INodeType

In code, a node is one class that implements `INodeType`.
It always has a description.
Then it implements the one run method that fits its type.
`execute` for regular nodes. `poll`, `trigger` or `webhook` for triggers. `supplyData` for AI sub-nodes.
The `methods` block holds helpers the editor calls, for example to load dropdown options.

## 15. How a node gets into the app

How does n8n find a node?
First, `package.json` lists the built node files in the `n8n.nodes` field.
The directory loader imports each class and reads its description.
The backend registers the type and its versions.
Then the frontend fetches the descriptions and shows them in the nodes panel.
Community nodes and MCP registry servers use different loaders, but they end up in the same registry.

## 16. Node types

Here is the full family tree.
Trigger nodes start a workflow. There are three kinds: webhook, polling and generic.
Regular nodes transform items. They are programmatic or declarative.
AI sub-nodes plug into an agent, through `supplyData`.
In our example, the Gmail trigger is polling, IF and Slack are programmatic, and the OpenAI model and the customer lookup are AI sub-nodes.

## 17. Triggers (~8 min)

Every workflow starts with a trigger.

## 18. Three ways to start a workflow

There are three ways to start a workflow.
Webhook: the service calls us when something happens.
Polling: we ask the service for new data on a schedule. Our Gmail Trigger works like this.
Generic: we keep a connection open, for example to a message broker.
Which one you use depends on what the service supports.
This matters beyond our team. Other teams have had to plan around polling triggers too.

## 19. Webhook triggers

Webhook triggers have a small lifecycle.
When a workflow is published, `checkExists` asks if our webhook is already registered.
If not, `create` registers our URL with the service.
When an event arrives, `webhook` handles it.
When the workflow is unpublished, `delete` removes the registration.
The main point: the node only describes this lifecycle. n8n calls it at the right time, so no subscription is left behind.
One more thing: services sign their requests, so check the signature before you emit items.

## 20. Polling triggers

Polling triggers set `polling: true` in the description.
The loader then adds a "Poll Times" setting to the node.
Core calls `poll` on that schedule.
The node stores where it left off in static data, for example the last check time.
If there is nothing new, return `null`, and no execution starts.
A common bug: static data is updated at the wrong moment, so items are duplicated or missed.

## 21. Generic triggers

Generic triggers call `trigger` once, when the workflow is published.
Usually they open a connection with a third-party SDK.
Each time a message arrives, `this.emit` starts a run.
The returned `closeFunction` cleans up when the workflow is unpublished.
Watch out for dropped connections. If we don't handle them, the trigger can stop without anyone noticing.

## 22. Data flow (~10 min)

Now, data flow. This is the part that surprises most people.

## 23. Everything is a list of items

Nodes pass lists of items to each other.
Each item has three parts.
`json` holds the data, and it must be JSON-serializable.
`binary` holds files, but only their metadata.
`pairedItem` records which input item this item came from.
If the Gmail Trigger finds three emails, the next node gets three items.

## 24. One array per output

A node returns an array of arrays.
The outer array has one entry per output. The inner array holds the items for that output.
Most nodes have one output.
IF has two: true and false.
Items on an output with no connection are dropped. That is expected.

## 25. The execute loop

Most programmatic nodes loop over their input items. Here is a simplified Slack node.
Inside the loop, it reads its parameters per item.
Why per item? Because a parameter can be an expression.
In our workflow, the Slack text is `$json.output`, the summary from the agent.
That gives a different message for every item.
Use the helpers for HTTP calls. They apply the credential for you.

## 26. Binary data, by reference

Binary data does not travel inside the item.
The item only holds a reference. The bytes live in the binary data store, on disk or in S3.
So never read `item.binary.data` directly.
Use `getBinaryDataBuffer` to read, and `prepareBinaryData` to write.
Direct reads can work locally and then fail in production.

## 27. pairedItem: item lineage

`pairedItem` links each item back to the item it came from.
Look at our example. Three emails arrive. Email B is not from a customer, so IF drops it.
Now the numbers no longer line up. IF item 1 is email 2.
Each node stores that link: "I came from item 2".
When Slack asks for the email subject, n8n follows the links back: 1, then 1, then 2. It finds email C.
If a node creates new items and forgets `pairedItem`, the chain breaks.
Then users see "Can't determine which item to use". This is one of our most common bug types.

## 28. Building nodes (~8 min)

Next, how we build nodes.

## 29. Declarative vs programmatic

There are two ways to write a node.
Declarative nodes describe the HTTP request, and n8n runs it for you.
Programmatic nodes have an `execute` function, so you have full control.
Declarative is less code, and it fits simple REST APIs.
Programmatic fits SDKs, other protocols, and complex logic.
Most of our core nodes are programmatic.

## 30. Parameters: resource → operation

Most integration nodes follow the same pattern: a resource, then an operation.
For example: resource "Message", operation "Send".
Each pair becomes an action in the nodes panel, like "Slack: Send a message".
`displayOptions` show a field only when it is relevant.
A resource locator lets users pick from a list, or paste an ID or a URL.

## 31. Credentials

Credentials are separate classes, one per file.
`authenticate` adds the auth to each outgoing request, for example a Bearer header.
`test` sends a cheap request, and that gives users the green check in the UI.
For OAuth2, you extend the OAuth2 base type, and n8n runs the flow.
On the node side, you list the credential by name.

## 32. Versioning

Every saved node stores its version.
Old workflows should keep their old behaviour.
For small changes, use light versioning. One class lists several versions and checks `typeVersion` where behaviour differs.
For big changes, use full versioning. A wrapper maps each version to a separate class in its own folder, like `v1` and `v2`.
The old files stay untouched.
If you change behaviour without a new version, you can break customer workflows.

## 33. AI nodes (~6 min)

Last part: AI nodes. Same node system, different connections.

## 34. Connection types

Regular nodes connect with `main`.
AI nodes add typed connections, like language model, memory and tool.
Only matching types can connect. A model cannot go into a memory slot.
Sub-nodes do not process items. They implement `supplyData` and hand the agent a ready object, like a chat model.
In our example, the OpenAI model and the customer lookup plug into the agent.

## 35. Any node can be a tool

With one flag, `usableAsTool`, a regular node can also be an agent tool.
The model fills its parameters at run time, with `$fromAI`.
The tool runs the same `execute` code, so one implementation serves two uses.
MCP registry servers plug into the same tool port.
That connects back to part one: nodes, MCP and channels all feed agents.

## 36. Questions

That's it from me. What questions do you have?
Everything we skipped, like testing, error handling and local dev, is on the Notion "Nodes onboarding" page.
You can always find us in #team-nodes.
