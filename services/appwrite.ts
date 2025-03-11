import { Client, Databases, ID, Query } from "react-native-appwrite";
// track searches made by a user

export const APPWRITE_CONFIG = {
  PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  COLLECTION_ID: process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!,
  ENDPOINT_URL: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT_URL!,
};

export const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.ENDPOINT_URL)
  .setProject(APPWRITE_CONFIG.PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    // check if a record of that search has already been stored
    const result = await database.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTION_ID,
      [Query.equal("searchTerm", query)]
    );
    // if a document is found, increment the searchCount field
    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      // if no document is found, create a new one and set the searchCount to 1
      await database.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: query,
          movie_id: movie.id,
          count: 1,
          title: movie.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTION_ID,
      [Query.limit(5), Query.orderDesc("count")]
    );

    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
