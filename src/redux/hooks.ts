/* eslint-disable @typescript-eslint/no-explicit-any */
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState } from "./store";

export const useAppDispatch: any = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
