// This code is part of the repository https://github.com/aldrin-lim/server-lottie-animation-manager
// and is only for showcase purposes.

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";
import { createClient } from "@supabase/supabase-js";
import { GraphQLScalarType, Kind } from "graphql";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Define JSON scalar type
const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Lottie JSON scalar type",
  serialize(value: unknown): string {
    return JSON.stringify(value);
  },
  parseValue(value: unknown): unknown {
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    return value;
  },
  parseLiteral(ast): unknown {
    if (ast.kind === Kind.STRING) {
      return JSON.parse(ast.value);
    } else if (ast.kind === Kind.OBJECT) {
      throw new Error("Object literal not supported");
    }
    return null;
  },
});
// Define GraphQL schema
const typeDefs = gql`
  scalar JSON

  enum AnimationStatus {
    SYNCED
    CREATED
    UPDATED
    DELETED
    MODIFIED
  }

  type Animation {
    id: ID!
    userId: String!
    name: String!
    jsonContent: JSON!
    createdAt: String!
    updatedAt: String!
    _status: AnimationStatus
    _lastSyncedAt: String
  }

  input AnimationInput {
    id: ID!
    name: String!
    jsonContent: JSON!
    createdAt: String!
    updatedAt: String!
    _status: AnimationStatus
    _lastSyncedAt: String
  }

  type Query {
    getAnimations(userId: String!): [Animation!]!
    getAnimation(userId: String!, id: ID!): Animation
  }

  type Mutation {
    addAnimation(userId: String!, name: String!, jsonContent: JSON!): Animation!
    updateAnimation(id: ID!, name: String, jsonContent: JSON): Animation!
    deleteAnimation(userId: String!, id: ID!): Boolean!
    syncAnimations(userId: String!, animations: [AnimationInput!]!): [Animation!]!
  }
`;

// Define resolvers
const resolvers = {
  JSON: JSONScalar,
  Query: {
    getAnimations: async (_: any, { userId }: { userId: string }) => {
      const { data, error } = await supabase
        .from("animations")
        .select("*")
        .eq("userId", userId);

      if (error) throw new Error(error.message);
      return data;
    },
    getAnimation: async (
      _: any,
      { userId, id }: { userId: string; id: string }
    ) => {
      const { data, error } = await supabase
        .from("animations")
        .select("*")
        .eq("userId", userId)
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  },
  Mutation: {
    addAnimation: async (
      _: any,
      {
        userId,
        name,
        jsonContent,
      }: { userId: string; name: string; jsonContent: any }
    ) => {
      const { data, error } = await supabase
        .from("animations")
        .insert({ userId, name, jsonContent })
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    updateAnimation: async (
      _: any,
      {
        id,
        name,
        jsonContent,
      }: { id: string; name?: string; jsonContent?: any }
    ) => {
      const { data, error } = await supabase
        .from("animations")
        .update({ name, jsonContent })
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    deleteAnimation: async (
      _: any,
      { userId, id }: { userId: string; id: string }
    ) => {
      const { error } = await supabase
        .from("animations")
        .delete()
        .eq("userId", userId)
        .eq("id", id);

      if (error) throw new Error(error.message);
      return true;
    },
    syncAnimations: async (_: any, { userId, animations }: { userId: string, animations: any[] }) => {
      // Fetch all existing animations for the user
      const { data: existingAnimations, error: fetchError } = await supabase
        .from('animations')
        .select('*')
        .eq('userId', userId);

      if (fetchError) throw new Error(fetchError.message);

      const currentTimestamp = new Date().toISOString();

      const animationsToUpsert = animations.filter(clientAnimation => 
        clientAnimation._status !== 'SYNCED' && clientAnimation._status !== 'DELETED'
      ).map(clientAnimation => {
        const serverAnimation = existingAnimations.find(a => a.id === clientAnimation.id);

        if (!serverAnimation || new Date(clientAnimation.updatedAt) > new Date(serverAnimation.updatedAt)) {
          return {
            id: clientAnimation.id,
            userId,
            name: clientAnimation.name,
            description: clientAnimation.description,
            jsonContent: clientAnimation.jsonContent,
            createdAt: clientAnimation.createdAt || currentTimestamp,
            updatedAt: clientAnimation.updatedAt || currentTimestamp,
            _status: 'SYNCED',
            _lastSyncedAt: currentTimestamp
          };
        }

        return null;
      }).filter(Boolean);

      const animationsToDelete = animations
        .filter(a => a._status === 'DELETED')
        .map(a => a.id);

      if (animationsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('animations')
          .upsert(animationsToUpsert, { onConflict: 'id' });

        if (upsertError) throw new Error(upsertError.message);
      }

      if (animationsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('animations')
          .delete()
          .in('id', animationsToDelete);

        if (deleteError) throw new Error(deleteError.message);
      }

      // Fetch all animations again to return the most up-to-date data
      const { data: syncedAnimations, error: finalFetchError } = await supabase
        .from('animations')
        .select('*')
        .eq('userId', userId);

      if (finalFetchError) throw new Error(finalFetchError.message);

      // Ensure all required fields are present and not null
      return syncedAnimations.map(animation => ({
        ...animation,
        createdAt: animation.createdAt || currentTimestamp,
        updatedAt: animation.updatedAt || currentTimestamp,
        _status: animation._status || 'SYNCED',
        _lastSyncedAt: animation._lastSyncedAt || currentTimestamp
      }));
    },
  },
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
const startServer = async () => {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
    });
    console.log(`🚀 Server ready at: ${url}`);
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
};

startServer();
