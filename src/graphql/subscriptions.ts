/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateCuestionarioDefinition = /* GraphQL */ `subscription OnCreateCuestionarioDefinition(
  $filter: ModelSubscriptionCuestionarioDefinitionFilterInput
) {
  onCreateCuestionarioDefinition(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCuestionarioDefinitionSubscriptionVariables,
  APITypes.OnCreateCuestionarioDefinitionSubscription
>;
export const onCreateCuestionarioResponse = /* GraphQL */ `subscription OnCreateCuestionarioResponse(
  $filter: ModelSubscriptionCuestionarioResponseFilterInput
) {
  onCreateCuestionarioResponse(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateCuestionarioResponseSubscriptionVariables,
  APITypes.OnCreateCuestionarioResponseSubscription
>;
export const onCreateToken = /* GraphQL */ `subscription OnCreateToken($filter: ModelSubscriptionTokenFilterInput) {
  onCreateToken(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTokenSubscriptionVariables,
  APITypes.OnCreateTokenSubscription
>;
export const onDeleteCuestionarioDefinition = /* GraphQL */ `subscription OnDeleteCuestionarioDefinition(
  $filter: ModelSubscriptionCuestionarioDefinitionFilterInput
) {
  onDeleteCuestionarioDefinition(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCuestionarioDefinitionSubscriptionVariables,
  APITypes.OnDeleteCuestionarioDefinitionSubscription
>;
export const onDeleteCuestionarioResponse = /* GraphQL */ `subscription OnDeleteCuestionarioResponse(
  $filter: ModelSubscriptionCuestionarioResponseFilterInput
) {
  onDeleteCuestionarioResponse(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteCuestionarioResponseSubscriptionVariables,
  APITypes.OnDeleteCuestionarioResponseSubscription
>;
export const onDeleteToken = /* GraphQL */ `subscription OnDeleteToken($filter: ModelSubscriptionTokenFilterInput) {
  onDeleteToken(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTokenSubscriptionVariables,
  APITypes.OnDeleteTokenSubscription
>;
export const onUpdateCuestionarioDefinition = /* GraphQL */ `subscription OnUpdateCuestionarioDefinition(
  $filter: ModelSubscriptionCuestionarioDefinitionFilterInput
) {
  onUpdateCuestionarioDefinition(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCuestionarioDefinitionSubscriptionVariables,
  APITypes.OnUpdateCuestionarioDefinitionSubscription
>;
export const onUpdateCuestionarioResponse = /* GraphQL */ `subscription OnUpdateCuestionarioResponse(
  $filter: ModelSubscriptionCuestionarioResponseFilterInput
) {
  onUpdateCuestionarioResponse(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateCuestionarioResponseSubscriptionVariables,
  APITypes.OnUpdateCuestionarioResponseSubscription
>;
export const onUpdateToken = /* GraphQL */ `subscription OnUpdateToken($filter: ModelSubscriptionTokenFilterInput) {
  onUpdateToken(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTokenSubscriptionVariables,
  APITypes.OnUpdateTokenSubscription
>;
