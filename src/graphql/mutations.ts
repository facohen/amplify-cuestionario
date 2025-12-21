/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createCuestionarioDefinition = /* GraphQL */ `mutation CreateCuestionarioDefinition(
  $condition: ModelCuestionarioDefinitionConditionInput
  $input: CreateCuestionarioDefinitionInput!
) {
  createCuestionarioDefinition(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateCuestionarioDefinitionMutationVariables,
  APITypes.CreateCuestionarioDefinitionMutation
>;
export const createCuestionarioResponse = /* GraphQL */ `mutation CreateCuestionarioResponse(
  $condition: ModelCuestionarioResponseConditionInput
  $input: CreateCuestionarioResponseInput!
) {
  createCuestionarioResponse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateCuestionarioResponseMutationVariables,
  APITypes.CreateCuestionarioResponseMutation
>;
export const createToken = /* GraphQL */ `mutation CreateToken(
  $condition: ModelTokenConditionInput
  $input: CreateTokenInput!
) {
  createToken(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateTokenMutationVariables,
  APITypes.CreateTokenMutation
>;
export const deleteCuestionarioDefinition = /* GraphQL */ `mutation DeleteCuestionarioDefinition(
  $condition: ModelCuestionarioDefinitionConditionInput
  $input: DeleteCuestionarioDefinitionInput!
) {
  deleteCuestionarioDefinition(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteCuestionarioDefinitionMutationVariables,
  APITypes.DeleteCuestionarioDefinitionMutation
>;
export const deleteCuestionarioResponse = /* GraphQL */ `mutation DeleteCuestionarioResponse(
  $condition: ModelCuestionarioResponseConditionInput
  $input: DeleteCuestionarioResponseInput!
) {
  deleteCuestionarioResponse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteCuestionarioResponseMutationVariables,
  APITypes.DeleteCuestionarioResponseMutation
>;
export const deleteToken = /* GraphQL */ `mutation DeleteToken(
  $condition: ModelTokenConditionInput
  $input: DeleteTokenInput!
) {
  deleteToken(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteTokenMutationVariables,
  APITypes.DeleteTokenMutation
>;
export const updateCuestionarioDefinition = /* GraphQL */ `mutation UpdateCuestionarioDefinition(
  $condition: ModelCuestionarioDefinitionConditionInput
  $input: UpdateCuestionarioDefinitionInput!
) {
  updateCuestionarioDefinition(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateCuestionarioDefinitionMutationVariables,
  APITypes.UpdateCuestionarioDefinitionMutation
>;
export const updateCuestionarioResponse = /* GraphQL */ `mutation UpdateCuestionarioResponse(
  $condition: ModelCuestionarioResponseConditionInput
  $input: UpdateCuestionarioResponseInput!
) {
  updateCuestionarioResponse(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateCuestionarioResponseMutationVariables,
  APITypes.UpdateCuestionarioResponseMutation
>;
export const updateToken = /* GraphQL */ `mutation UpdateToken(
  $condition: ModelTokenConditionInput
  $input: UpdateTokenInput!
) {
  updateToken(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateTokenMutationVariables,
  APITypes.UpdateTokenMutation
>;
