/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CuestionarioDefinition = {
  __typename: "CuestionarioDefinition",
  creadoPor?: string | null,
  createdAt: string,
  description?: string | null,
  id: string,
  questionsJson: string,
  status?: CuestionarioDefinitionStatus | null,
  title: string,
  totalQuestions: number,
  updatedAt: string,
  version: string,
};

export enum CuestionarioDefinitionStatus {
  active = "active",
  archived = "archived",
  draft = "draft",
}


export type CuestionarioResponse = {
  __typename: "CuestionarioResponse",
  answersJson: string,
  createdAt: string,
  cuestionarioId: string,
  cuestionarioVersion: string,
  finishedAt?: string | null,
  id: string,
  startedAt: string,
  status?: CuestionarioResponseStatus | null,
  tokenId: string,
  totalTimeMs?: number | null,
  updatedAt: string,
};

export enum CuestionarioResponseStatus {
  abandoned = "abandoned",
  completed = "completed",
  in_progress = "in_progress",
}


export type Token = {
  __typename: "Token",
  createdAt: string,
  cuestionarioId: string,
  expiresAt?: string | null,
  id: string,
  status?: TokenStatus | null,
  updatedAt: string,
  usedAt?: string | null,
};

export enum TokenStatus {
  active = "active",
  expired = "expired",
  revoked = "revoked",
  used = "used",
}


export type ModelCuestionarioDefinitionFilterInput = {
  and?: Array< ModelCuestionarioDefinitionFilterInput | null > | null,
  creadoPor?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelCuestionarioDefinitionFilterInput | null,
  or?: Array< ModelCuestionarioDefinitionFilterInput | null > | null,
  questionsJson?: ModelStringInput | null,
  status?: ModelCuestionarioDefinitionStatusInput | null,
  title?: ModelStringInput | null,
  totalQuestions?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  version?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelCuestionarioDefinitionStatusInput = {
  eq?: CuestionarioDefinitionStatus | null,
  ne?: CuestionarioDefinitionStatus | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelCuestionarioDefinitionConnection = {
  __typename: "ModelCuestionarioDefinitionConnection",
  items:  Array<CuestionarioDefinition | null >,
  nextToken?: string | null,
};

export type ModelCuestionarioResponseFilterInput = {
  and?: Array< ModelCuestionarioResponseFilterInput | null > | null,
  answersJson?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  cuestionarioId?: ModelStringInput | null,
  cuestionarioVersion?: ModelStringInput | null,
  finishedAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelCuestionarioResponseFilterInput | null,
  or?: Array< ModelCuestionarioResponseFilterInput | null > | null,
  startedAt?: ModelStringInput | null,
  status?: ModelCuestionarioResponseStatusInput | null,
  tokenId?: ModelStringInput | null,
  totalTimeMs?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelCuestionarioResponseStatusInput = {
  eq?: CuestionarioResponseStatus | null,
  ne?: CuestionarioResponseStatus | null,
};

export type ModelCuestionarioResponseConnection = {
  __typename: "ModelCuestionarioResponseConnection",
  items:  Array<CuestionarioResponse | null >,
  nextToken?: string | null,
};

export type ModelTokenFilterInput = {
  and?: Array< ModelTokenFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  cuestionarioId?: ModelStringInput | null,
  expiresAt?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelTokenFilterInput | null,
  or?: Array< ModelTokenFilterInput | null > | null,
  status?: ModelTokenStatusInput | null,
  updatedAt?: ModelStringInput | null,
  usedAt?: ModelStringInput | null,
};

export type ModelTokenStatusInput = {
  eq?: TokenStatus | null,
  ne?: TokenStatus | null,
};

export type ModelTokenConnection = {
  __typename: "ModelTokenConnection",
  items:  Array<Token | null >,
  nextToken?: string | null,
};

export type ModelCuestionarioDefinitionConditionInput = {
  and?: Array< ModelCuestionarioDefinitionConditionInput | null > | null,
  creadoPor?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  description?: ModelStringInput | null,
  not?: ModelCuestionarioDefinitionConditionInput | null,
  or?: Array< ModelCuestionarioDefinitionConditionInput | null > | null,
  questionsJson?: ModelStringInput | null,
  status?: ModelCuestionarioDefinitionStatusInput | null,
  title?: ModelStringInput | null,
  totalQuestions?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
  version?: ModelStringInput | null,
};

export type CreateCuestionarioDefinitionInput = {
  creadoPor?: string | null,
  description?: string | null,
  id?: string | null,
  questionsJson: string,
  status?: CuestionarioDefinitionStatus | null,
  title: string,
  totalQuestions: number,
  version: string,
};

export type ModelCuestionarioResponseConditionInput = {
  and?: Array< ModelCuestionarioResponseConditionInput | null > | null,
  answersJson?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  cuestionarioId?: ModelStringInput | null,
  cuestionarioVersion?: ModelStringInput | null,
  finishedAt?: ModelStringInput | null,
  not?: ModelCuestionarioResponseConditionInput | null,
  or?: Array< ModelCuestionarioResponseConditionInput | null > | null,
  startedAt?: ModelStringInput | null,
  status?: ModelCuestionarioResponseStatusInput | null,
  tokenId?: ModelStringInput | null,
  totalTimeMs?: ModelIntInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateCuestionarioResponseInput = {
  answersJson: string,
  cuestionarioId: string,
  cuestionarioVersion: string,
  finishedAt?: string | null,
  id?: string | null,
  startedAt: string,
  status?: CuestionarioResponseStatus | null,
  tokenId: string,
  totalTimeMs?: number | null,
};

export type ModelTokenConditionInput = {
  and?: Array< ModelTokenConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  cuestionarioId?: ModelStringInput | null,
  expiresAt?: ModelStringInput | null,
  not?: ModelTokenConditionInput | null,
  or?: Array< ModelTokenConditionInput | null > | null,
  status?: ModelTokenStatusInput | null,
  updatedAt?: ModelStringInput | null,
  usedAt?: ModelStringInput | null,
};

export type CreateTokenInput = {
  cuestionarioId: string,
  expiresAt?: string | null,
  id?: string | null,
  status?: TokenStatus | null,
  usedAt?: string | null,
};

export type DeleteCuestionarioDefinitionInput = {
  id: string,
};

export type DeleteCuestionarioResponseInput = {
  id: string,
};

export type DeleteTokenInput = {
  id: string,
};

export type UpdateCuestionarioDefinitionInput = {
  creadoPor?: string | null,
  description?: string | null,
  id: string,
  questionsJson?: string | null,
  status?: CuestionarioDefinitionStatus | null,
  title?: string | null,
  totalQuestions?: number | null,
  version?: string | null,
};

export type UpdateCuestionarioResponseInput = {
  answersJson?: string | null,
  cuestionarioId?: string | null,
  cuestionarioVersion?: string | null,
  finishedAt?: string | null,
  id: string,
  startedAt?: string | null,
  status?: CuestionarioResponseStatus | null,
  tokenId?: string | null,
  totalTimeMs?: number | null,
};

export type UpdateTokenInput = {
  cuestionarioId?: string | null,
  expiresAt?: string | null,
  id: string,
  status?: TokenStatus | null,
  usedAt?: string | null,
};

export type ModelSubscriptionCuestionarioDefinitionFilterInput = {
  and?: Array< ModelSubscriptionCuestionarioDefinitionFilterInput | null > | null,
  creadoPor?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionCuestionarioDefinitionFilterInput | null > | null,
  questionsJson?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  totalQuestions?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  version?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionCuestionarioResponseFilterInput = {
  and?: Array< ModelSubscriptionCuestionarioResponseFilterInput | null > | null,
  answersJson?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  cuestionarioId?: ModelSubscriptionStringInput | null,
  cuestionarioVersion?: ModelSubscriptionStringInput | null,
  finishedAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionCuestionarioResponseFilterInput | null > | null,
  startedAt?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  tokenId?: ModelSubscriptionStringInput | null,
  totalTimeMs?: ModelSubscriptionIntInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionTokenFilterInput = {
  and?: Array< ModelSubscriptionTokenFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  cuestionarioId?: ModelSubscriptionStringInput | null,
  expiresAt?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionTokenFilterInput | null > | null,
  status?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  usedAt?: ModelSubscriptionStringInput | null,
};

export type GetCuestionarioDefinitionQueryVariables = {
  id: string,
};

export type GetCuestionarioDefinitionQuery = {
  getCuestionarioDefinition?:  {
    __typename: "CuestionarioDefinition",
    creadoPor?: string | null,
    createdAt: string,
    description?: string | null,
    id: string,
    questionsJson: string,
    status?: CuestionarioDefinitionStatus | null,
    title: string,
    totalQuestions: number,
    updatedAt: string,
    version: string,
  } | null,
};

export type GetCuestionarioResponseQueryVariables = {
  id: string,
};

export type GetCuestionarioResponseQuery = {
  getCuestionarioResponse?:  {
    __typename: "CuestionarioResponse",
    answersJson: string,
    createdAt: string,
    cuestionarioId: string,
    cuestionarioVersion: string,
    finishedAt?: string | null,
    id: string,
    startedAt: string,
    status?: CuestionarioResponseStatus | null,
    tokenId: string,
    totalTimeMs?: number | null,
    updatedAt: string,
  } | null,
};

export type GetTokenQueryVariables = {
  id: string,
};

export type GetTokenQuery = {
  getToken?:  {
    __typename: "Token",
    createdAt: string,
    cuestionarioId: string,
    expiresAt?: string | null,
    id: string,
    status?: TokenStatus | null,
    updatedAt: string,
    usedAt?: string | null,
  } | null,
};

export type ListCuestionarioDefinitionsQueryVariables = {
  filter?: ModelCuestionarioDefinitionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCuestionarioDefinitionsQuery = {
  listCuestionarioDefinitions?:  {
    __typename: "ModelCuestionarioDefinitionConnection",
    items:  Array< {
      __typename: "CuestionarioDefinition",
      creadoPor?: string | null,
      createdAt: string,
      description?: string | null,
      id: string,
      questionsJson: string,
      status?: CuestionarioDefinitionStatus | null,
      title: string,
      totalQuestions: number,
      updatedAt: string,
      version: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListCuestionarioResponsesQueryVariables = {
  filter?: ModelCuestionarioResponseFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCuestionarioResponsesQuery = {
  listCuestionarioResponses?:  {
    __typename: "ModelCuestionarioResponseConnection",
    items:  Array< {
      __typename: "CuestionarioResponse",
      answersJson: string,
      createdAt: string,
      cuestionarioId: string,
      cuestionarioVersion: string,
      finishedAt?: string | null,
      id: string,
      startedAt: string,
      status?: CuestionarioResponseStatus | null,
      tokenId: string,
      totalTimeMs?: number | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListTokensQueryVariables = {
  filter?: ModelTokenFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTokensQuery = {
  listTokens?:  {
    __typename: "ModelTokenConnection",
    items:  Array< {
      __typename: "Token",
      createdAt: string,
      cuestionarioId: string,
      expiresAt?: string | null,
      id: string,
      status?: TokenStatus | null,
      updatedAt: string,
      usedAt?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateCuestionarioDefinitionMutationVariables = {
  condition?: ModelCuestionarioDefinitionConditionInput | null,
  input: CreateCuestionarioDefinitionInput,
};

export type CreateCuestionarioDefinitionMutation = {
  createCuestionarioDefinition?:  {
    __typename: "CuestionarioDefinition",
    creadoPor?: string | null,
    createdAt: string,
    description?: string | null,
    id: string,
    questionsJson: string,
    status?: CuestionarioDefinitionStatus | null,
    title: string,
    totalQuestions: number,
    updatedAt: string,
    version: string,
  } | null,
};

export type CreateCuestionarioResponseMutationVariables = {
  condition?: ModelCuestionarioResponseConditionInput | null,
  input: CreateCuestionarioResponseInput,
};

export type CreateCuestionarioResponseMutation = {
  createCuestionarioResponse?:  {
    __typename: "CuestionarioResponse",
    answersJson: string,
    createdAt: string,
    cuestionarioId: string,
    cuestionarioVersion: string,
    finishedAt?: string | null,
    id: string,
    startedAt: string,
    status?: CuestionarioResponseStatus | null,
    tokenId: string,
    totalTimeMs?: number | null,
    updatedAt: string,
  } | null,
};

export type CreateTokenMutationVariables = {
  condition?: ModelTokenConditionInput | null,
  input: CreateTokenInput,
};

export type CreateTokenMutation = {
  createToken?:  {
    __typename: "Token",
    createdAt: string,
    cuestionarioId: string,
    expiresAt?: string | null,
    id: string,
    status?: TokenStatus | null,
    updatedAt: string,
    usedAt?: string | null,
  } | null,
};

export type DeleteCuestionarioDefinitionMutationVariables = {
  condition?: ModelCuestionarioDefinitionConditionInput | null,
  input: DeleteCuestionarioDefinitionInput,
};

export type DeleteCuestionarioDefinitionMutation = {
  deleteCuestionarioDefinition?:  {
    __typename: "CuestionarioDefinition",
    creadoPor?: string | null,
    createdAt: string,
    description?: string | null,
    id: string,
    questionsJson: string,
    status?: CuestionarioDefinitionStatus | null,
    title: string,
    totalQuestions: number,
    updatedAt: string,
    version: string,
  } | null,
};

export type DeleteCuestionarioResponseMutationVariables = {
  condition?: ModelCuestionarioResponseConditionInput | null,
  input: DeleteCuestionarioResponseInput,
};

export type DeleteCuestionarioResponseMutation = {
  deleteCuestionarioResponse?:  {
    __typename: "CuestionarioResponse",
    answersJson: string,
    createdAt: string,
    cuestionarioId: string,
    cuestionarioVersion: string,
    finishedAt?: string | null,
    id: string,
    startedAt: string,
    status?: CuestionarioResponseStatus | null,
    tokenId: string,
    totalTimeMs?: number | null,
    updatedAt: string,
  } | null,
};

export type DeleteTokenMutationVariables = {
  condition?: ModelTokenConditionInput | null,
  input: DeleteTokenInput,
};

export type DeleteTokenMutation = {
  deleteToken?:  {
    __typename: "Token",
    createdAt: string,
    cuestionarioId: string,
    expiresAt?: string | null,
    id: string,
    status?: TokenStatus | null,
    updatedAt: string,
    usedAt?: string | null,
  } | null,
};

export type UpdateCuestionarioDefinitionMutationVariables = {
  condition?: ModelCuestionarioDefinitionConditionInput | null,
  input: UpdateCuestionarioDefinitionInput,
};

export type UpdateCuestionarioDefinitionMutation = {
  updateCuestionarioDefinition?:  {
    __typename: "CuestionarioDefinition",
    creadoPor?: string | null,
    createdAt: string,
    description?: string | null,
    id: string,
    questionsJson: string,
    status?: CuestionarioDefinitionStatus | null,
    title: string,
    totalQuestions: number,
    updatedAt: string,
    version: string,
  } | null,
};

export type UpdateCuestionarioResponseMutationVariables = {
  condition?: ModelCuestionarioResponseConditionInput | null,
  input: UpdateCuestionarioResponseInput,
};

export type UpdateCuestionarioResponseMutation = {
  updateCuestionarioResponse?:  {
    __typename: "CuestionarioResponse",
    answersJson: string,
    createdAt: string,
    cuestionarioId: string,
    cuestionarioVersion: string,
    finishedAt?: string | null,
    id: string,
    startedAt: string,
    status?: CuestionarioResponseStatus | null,
    tokenId: string,
    totalTimeMs?: number | null,
    updatedAt: string,
  } | null,
};

export type UpdateTokenMutationVariables = {
  condition?: ModelTokenConditionInput | null,
  input: UpdateTokenInput,
};

export type UpdateTokenMutation = {
  updateToken?:  {
    __typename: "Token",
    createdAt: string,
    cuestionarioId: string,
    expiresAt?: string | null,
    id: string,
    status?: TokenStatus | null,
    updatedAt: string,
    usedAt?: string | null,
  } | null,
};

export type OnCreateCuestionarioDefinitionSubscriptionVariables = {
  filter?: ModelSubscriptionCuestionarioDefinitionFilterInput | null,
};

export type OnCreateCuestionarioDefinitionSubscription = {
  onCreateCuestionarioDefinition?:  {
    __typename: "CuestionarioDefinition",
    creadoPor?: string | null,
    createdAt: string,
    description?: string | null,
    id: string,
    questionsJson: string,
    status?: CuestionarioDefinitionStatus | null,
    title: string,
    totalQuestions: number,
    updatedAt: string,
    version: string,
  } | null,
};

export type OnCreateCuestionarioResponseSubscriptionVariables = {
  filter?: ModelSubscriptionCuestionarioResponseFilterInput | null,
};

export type OnCreateCuestionarioResponseSubscription = {
  onCreateCuestionarioResponse?:  {
    __typename: "CuestionarioResponse",
    answersJson: string,
    createdAt: string,
    cuestionarioId: string,
    cuestionarioVersion: string,
    finishedAt?: string | null,
    id: string,
    startedAt: string,
    status?: CuestionarioResponseStatus | null,
    tokenId: string,
    totalTimeMs?: number | null,
    updatedAt: string,
  } | null,
};

export type OnCreateTokenSubscriptionVariables = {
  filter?: ModelSubscriptionTokenFilterInput | null,
};

export type OnCreateTokenSubscription = {
  onCreateToken?:  {
    __typename: "Token",
    createdAt: string,
    cuestionarioId: string,
    expiresAt?: string | null,
    id: string,
    status?: TokenStatus | null,
    updatedAt: string,
    usedAt?: string | null,
  } | null,
};

export type OnDeleteCuestionarioDefinitionSubscriptionVariables = {
  filter?: ModelSubscriptionCuestionarioDefinitionFilterInput | null,
};

export type OnDeleteCuestionarioDefinitionSubscription = {
  onDeleteCuestionarioDefinition?:  {
    __typename: "CuestionarioDefinition",
    creadoPor?: string | null,
    createdAt: string,
    description?: string | null,
    id: string,
    questionsJson: string,
    status?: CuestionarioDefinitionStatus | null,
    title: string,
    totalQuestions: number,
    updatedAt: string,
    version: string,
  } | null,
};

export type OnDeleteCuestionarioResponseSubscriptionVariables = {
  filter?: ModelSubscriptionCuestionarioResponseFilterInput | null,
};

export type OnDeleteCuestionarioResponseSubscription = {
  onDeleteCuestionarioResponse?:  {
    __typename: "CuestionarioResponse",
    answersJson: string,
    createdAt: string,
    cuestionarioId: string,
    cuestionarioVersion: string,
    finishedAt?: string | null,
    id: string,
    startedAt: string,
    status?: CuestionarioResponseStatus | null,
    tokenId: string,
    totalTimeMs?: number | null,
    updatedAt: string,
  } | null,
};

export type OnDeleteTokenSubscriptionVariables = {
  filter?: ModelSubscriptionTokenFilterInput | null,
};

export type OnDeleteTokenSubscription = {
  onDeleteToken?:  {
    __typename: "Token",
    createdAt: string,
    cuestionarioId: string,
    expiresAt?: string | null,
    id: string,
    status?: TokenStatus | null,
    updatedAt: string,
    usedAt?: string | null,
  } | null,
};

export type OnUpdateCuestionarioDefinitionSubscriptionVariables = {
  filter?: ModelSubscriptionCuestionarioDefinitionFilterInput | null,
};

export type OnUpdateCuestionarioDefinitionSubscription = {
  onUpdateCuestionarioDefinition?:  {
    __typename: "CuestionarioDefinition",
    creadoPor?: string | null,
    createdAt: string,
    description?: string | null,
    id: string,
    questionsJson: string,
    status?: CuestionarioDefinitionStatus | null,
    title: string,
    totalQuestions: number,
    updatedAt: string,
    version: string,
  } | null,
};

export type OnUpdateCuestionarioResponseSubscriptionVariables = {
  filter?: ModelSubscriptionCuestionarioResponseFilterInput | null,
};

export type OnUpdateCuestionarioResponseSubscription = {
  onUpdateCuestionarioResponse?:  {
    __typename: "CuestionarioResponse",
    answersJson: string,
    createdAt: string,
    cuestionarioId: string,
    cuestionarioVersion: string,
    finishedAt?: string | null,
    id: string,
    startedAt: string,
    status?: CuestionarioResponseStatus | null,
    tokenId: string,
    totalTimeMs?: number | null,
    updatedAt: string,
  } | null,
};

export type OnUpdateTokenSubscriptionVariables = {
  filter?: ModelSubscriptionTokenFilterInput | null,
};

export type OnUpdateTokenSubscription = {
  onUpdateToken?:  {
    __typename: "Token",
    createdAt: string,
    cuestionarioId: string,
    expiresAt?: string | null,
    id: string,
    status?: TokenStatus | null,
    updatedAt: string,
    usedAt?: string | null,
  } | null,
};
