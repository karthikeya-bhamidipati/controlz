import { configureStore } from "@reduxjs/toolkit";
import darkModeReducer from "./darkModeSlice";
import { persistStore, persistReducer } from "redux-persist";
import storageSession  from "redux-persist/lib/storage/session"; 
import { combineReducers } from "redux";

const persistConfig = {
  key: "root",
  storage: storageSession,
};

const rootReducer = combineReducers({
  darkMode: darkModeReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
export default store;
