'use client'

import styled from 'styled-components'
import { SwatchHeader, Title } from './../components'
import { Section, lgBodyCopy, mediumType, media } from './../styles'
import { spacing, colors } from './../styles/theme.json'
import type { ApiDocs, DocField } from '@/api/docs'

const ERROR_EXAMPLE = `{
  "error": {
    "code": "invalid_parameter",
    "message": "group must be one of a, b, c, d, e, f"
  }
}`

const ERROR_CODES: Record<number, string> = {
  400: '400 invalid_parameter',
  404: '404 not_found',
}

function Fields({
  fields,
  withIn,
}: {
  fields: readonly (DocField & { in?: string })[]
  withIn?: boolean
}) {
  return (
    <TableScroll>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            {withIn && <th>In</th>}
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.name}>
              <td>
                <code>{field.name}</code>
              </td>
              {withIn && <td>{field.in}</td>}
              <td>
                <code>{field.type}</code>
              </td>
              <td>{field.required ? 'yes' : 'no'}</td>
              <td>{field.description}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableScroll>
  )
}

export default function Api({ docs }: { docs: ApiDocs }) {
  const jsonConfig = JSON.stringify(
    { mcpServers: { 'sanzo-wada': { type: 'http', url: docs.mcpUrl } } },
    null,
    2
  )
  return (
    <>
      <SwatchHeader>
        <Title />
      </SwatchHeader>
      <Section>
        <Docs>
          <h2>API</h2>
          <p>{docs.description}</p>
          <p>
            There are two ways in: a <a href="#rest">REST API</a> for any HTTP client, and
            an <a href="#mcp">MCP server</a> for AI assistants and agents. Both are free,
            read-only and need no key.
          </p>
          <LinkList>
            <li>
              <a href="/api/v1/openapi.json">OpenAPI 3.1 description</a>: every endpoint
              and shape, machine-readable
            </li>
            <li>
              <a href="/llms.txt">llms.txt</a>: a plain-text summary for language models
            </li>
            <li>
              <a href="/assets/colors.json">colors.json</a>: all colors as one static file
            </li>
            <li>
              <a href="/">Index</a>: back to the dictionary
            </li>
          </LinkList>
        </Docs>

        <Docs id="rest">
          <h2>REST API</h2>
          <p>
            Base path <code>/api/v1</code>. Every endpoint answers <code>GET</code> and{' '}
            <code>HEAD</code> and returns JSON. A single resource comes back as{' '}
            <code>{'{ "data": … }'}</code> and a list as{' '}
            <code>{'{ "data": [ … ], "count": n }'}</code>. Every resource links to its
            page on the site (<code>url</code>), to itself in the API (
            <code>api_url</code>) and to its share image (<code>card_url</code>).
          </p>
          <p>
            Errors use the HTTP status and a JSON body with a code: <code>400</code>{' '}
            <code>invalid_parameter</code>, <code>404</code> <code>not_found</code> and{' '}
            <code>405</code> <code>method_not_allowed</code>.
          </p>
          <Code>{ERROR_EXAMPLE}</Code>
          <p>
            Any origin may call the API (CORS <code>*</code>). Responses are cached at the
            edge, and the data only changes when the site is deployed.
          </p>
        </Docs>

        {docs.endpoints.map((endpoint) => (
          <Docs id={endpoint.id} key={endpoint.id} data-endpoint={endpoint.path}>
            <h3>
              <code>GET {endpoint.path}</code>
            </h3>
            <p>
              <strong>{endpoint.summary}.</strong> {endpoint.description}
            </p>
            {endpoint.parameters.length > 0 && (
              <Fields fields={endpoint.parameters} withIn />
            )}
            <p>
              Returns {endpoint.returns}
              {endpoint.errors.length > 0 &&
                `. Errors: ${endpoint.errors.map((status) => ERROR_CODES[status]).join(', ')}`}
              .
            </p>
            <p>
              Example: <a href={endpoint.example}>{endpoint.example}</a>
            </p>
          </Docs>
        ))}

        <Docs id="resources">
          <h2>Resources</h2>
          <p>
            The objects inside <code>data</code>.
          </p>
        </Docs>
        {docs.schemas.map((schema) => (
          <Docs id={`schema-${schema.id}`} key={schema.id}>
            <h3>{schema.id}</h3>
            <p>
              {schema.description}
              {schema.extends && (
                <>
                  {schema.description && ' '}
                  Every field of{' '}
                  <a href={`#schema-${schema.extends}`}>{schema.extends}</a>, plus:
                </>
              )}
            </p>
            <Fields fields={schema.fields} />
          </Docs>
        ))}

        <Docs id="mcp">
          <h2>MCP server</h2>
          <p>
            A <a href="https://modelcontextprotocol.io">Model Context Protocol</a> server
            with the same data, so an assistant can look up colors and combinations
            itself. It uses the Streamable HTTP transport and needs no authentication.
            Tool results carry the same resources as the REST API, plus a short text
            summary with page links to cite.
          </p>
          <Code>{docs.mcpUrl}</Code>
          <p>Add it to Claude Code:</p>
          <Code>{`claude mcp add --transport http sanzo-wada ${docs.mcpUrl}`}</Code>
          <p>Or to a client configured with JSON:</p>
          <Code>{jsonConfig}</Code>
        </Docs>

        {docs.tools.map((tool) => (
          <Docs id={`tool-${tool.name}`} key={tool.name} data-tool={tool.name}>
            <h3>
              <code>{tool.name}</code>
            </h3>
            <p>
              <strong>{tool.title}.</strong> {tool.description}
            </p>
            <Fields fields={tool.inputs} />
          </Docs>
        ))}

        <Docs id="mcp-resources">
          <h3>Resource templates</h3>
          <p>Each returns the same JSON as the matching REST endpoint.</p>
          <LinkList>
            {docs.resourceTemplates.map((template) => (
              <li key={template.name}>
                <code>{template.uriTemplate}</code>: {template.description}
              </li>
            ))}
          </LinkList>
        </Docs>
      </Section>
    </>
  )
}

// STYLES
const Docs = styled.article`
  width: 100%;
  max-width: 84rem;
  margin: 0 auto;
  padding: ${spacing.double_pad} ${spacing.single_pad} 0;
  color: ${colors.black};
  scroll-margin-top: 6rem;
  &:last-child {
    padding-bottom: ${spacing.big_pad};
  }
  h2 {
    ${lgBodyCopy};
    padding-bottom: ${spacing.single_pad};
  }
  h3 {
    ${mediumType};
    padding-top: ${spacing.single_pad};
    padding-bottom: ${spacing.micro_pad};
    border-top: 1px solid ${colors.med_grey};
  }
  p {
    ${mediumType};
    line-height: 1.5;
    padding-bottom: ${spacing.single_pad};
    overflow-wrap: anywhere;
  }
  a {
    color: ${colors.black};
  }
  strong {
    font-family: 'fff-italic', system-ui, sans-serif;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.85em;
  }
`

const LinkList = styled.ul`
  ${mediumType};
  line-height: 1.5;
  padding-bottom: ${spacing.single_pad};
  li {
    padding-left: ${spacing.single_pad};
    text-indent: -${spacing.single_pad};
  }
  li::before {
    content: '— ';
  }
`

const Code = styled.pre`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1.6rem;
  line-height: 1.5;
  background-color: ${colors.grey};
  padding: ${spacing.single_pad};
  margin-bottom: ${spacing.single_pad};
  overflow-x: auto;
  white-space: pre;
`

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-bottom: ${spacing.single_pad};
`

const Table = styled.table`
  width: 100%;
  font-size: 1.6rem;
  line-height: 1.4;
  text-align: left;
  th {
    font-family: 'fff-italic', system-ui, sans-serif;
    border-bottom: 1px solid ${colors.black};
  }
  th,
  td {
    padding: ${spacing.micro_pad} ${spacing.single_pad} ${spacing.micro_pad} 0;
    vertical-align: top;
  }
  td {
    border-bottom: 1px solid ${colors.grey};
  }
  td:first-child,
  td:nth-child(2) {
    white-space: nowrap;
  }
  ${media.small`
    font-size: 1.4rem;
  `}
`
