/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getCuestionarioDefinition = /* GraphQL */ `query GetCuestionarioDefinition($id: ID!) {
  getCuestionarioDefinition(id: $id) {
    creadoPor
    createdAt
    description
    id
    questionsJson
    status
    title
    totalQuestions
    updatedAt
    version
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCuestionarioDefinitionQueryVariables,
  APITypes.GetCuestionarioDefinitionQuery
>;
export const getCuestionarioResponse = /* GraphQL */ `query GetCuestionarioResponse($id: ID!) {
  getCuestionarioResponse(id: $id) {
    answersJson
    createdAt
    cuestionarioId
    cuestionarioVersion
    finishedAt
    id
    startedAt
    status
    tokenId
    totalTimeMs
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCuestionarioResponseQueryVariables,
  APITypes.GetCuestionarioResponseQuery
>;
export const getToken = /* GraphQL */ `query GetToken($id: ID!) {
  getToken(id: $id) {
    createdAt
    cuestionarioId
    expiresAt
    id
    status
    updatedAt
    usedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTokenQueryVariables, APITypes.GetTokenQuery>;
export const listCuestionarioDefinitions = /* GraphQL */ `query ListCuestionarioDefinitions(
  $filter: ModelCuestionarioDefinitionFilterInput
  $limit: Int
  $nextToken: String
) {
  listCuestionarioDefinitions(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      creadoPor
      createdAt
      description
      id
      questionsJson
      status
      title
      totalQuestions
      updatedAt
      version
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCuestionarioDefinitionsQueryVariables,
  APITypes.ListCuestionarioDefinitionsQuery
>;
export const listCuestionarioResponses = /* GraphQL */ `query ListCuestionarioResponses(
  $filter: ModelCuestionarioResponseFilterInput
  $limit: Int
  $nextToken: String
) {
  listCuestionarioResponses(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      answersJson
      createdAt
      cuestionarioId
      cuestionarioVersion
      finishedAt
      id
      startedAt
      status
      tokenId
      totalTimeMs
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCuestionarioResponsesQueryVariables,
  APITypes.ListCuestionarioResponsesQuery
>;
export const listTokens = /* GraphQL */ `query ListTokens(
  $filter: ModelTokenFilterInput
  $limit: Int
  $nextToken: String
) {
  listTokens(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      cuestionarioId
      expiresAt
      id
      status
      updatedAt
      usedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTokensQueryVariables,
  APITypes.ListTokensQuery
>;
