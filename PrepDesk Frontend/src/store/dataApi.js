import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const dataApi = createApi({
    reducerPath: "dataApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
    tagTypes: ["Courses", "Path", "Checklist", "Diary", "Messages", "Reviews", "Playlists", "MyCourses"],
    endpoints: (b) => ({
        courses: b.query({ query: () => "/courses", providesTags: ["Courses"] }),
        path: b.query({ query: () => "/courses/path", providesTags: ["Path"] }),
        enroll: b.mutation({
            query: ({ id, on }) => ({ url: `/courses/${id}/enroll`, method: on ? "POST" : "DELETE" }),
            invalidatesTags: ["Courses", "Path"],
        }),
        toggle: b.mutation({
            query: ({ id, lessonId }) => ({ url: `/courses/${id}/lessons/${lessonId}/toggle`, method: "POST" }),
            invalidatesTags: ["Path"],
        }),
        checklist: b.query({ query: (m) => `/checklist?month=${m}`, providesTags: ["Checklist"] }),
        addItem: b.mutation({
            query: (body) => ({ url: "/checklist/items", method: "POST", body }), invalidatesTags: ["Checklist"],
        }),
        setItem: b.mutation({
            query: ({ id, done }) => ({ url: `/checklist/items/${id}`, method: "PATCH", body: { done } }), invalidatesTags: ["Checklist"],
        }),
        delItem: b.mutation({ query: (id) => ({ url: `/checklist/items/${id}`, method: "DELETE" }), invalidatesTags: ["Checklist"] }),
        addTarget: b.mutation({
            query: (body) => ({ url: "/checklist/targets", method: "POST", body }), invalidatesTags: ["Checklist"],
        }),
        bumpTarget: b.mutation({
            query: ({ id, delta }) => ({ url: `/checklist/targets/${id}`, method: "PATCH", body: { delta } }), invalidatesTags: ["Checklist"],
        }),
        delTarget: b.mutation({ query: (id) => ({ url: `/checklist/targets/${id}`, method: "DELETE" }), invalidatesTags: ["Checklist"] }),
        diary: b.query({ query: (y) => `/diary?year=${y}`, providesTags: ["Diary"] }),
        saveEntry: b.mutation({
            query: ({ date, text }) => ({ url: `/diary/${date}`, method: "PUT", body: { text } }),
        }),
        messages: b.query({ query: (room) => `/chat/messages?room=${encodeURIComponent(room)}`, providesTags: ["Messages"] }),
        send: b.mutation({ query: (body) => ({ url: "/chat/messages", method: "POST", body }), invalidatesTags: ["Messages"] }),
        delMessage: b.mutation({ query: (id) => ({ url: `/chat/messages/${id}`, method: "DELETE" }), invalidatesTags: ["Messages"] }),
        reviews: b.query({ query: (t) => `/reviews${t ? `?target=${t}` : ""}`, providesTags: ["Reviews"] }),
        rate: b.mutation({
            query: (body) => ({ url: "/reviews", method: "POST", body }), invalidatesTags: ["Reviews", "Courses", "Playlists"],
        }),
        delReview: b.mutation({ query: (id) => ({ url: `/reviews/${id}`, method: "DELETE" }), invalidatesTags: ["Reviews", "Courses"] }),
        playlists: b.query({ query: (c) => `/playlists?category=${encodeURIComponent(c)}`, providesTags: ["Playlists"] }),
        addPlaylist: b.mutation({
            query: (body) => ({ url: "/playlists", method: "POST", body }), invalidatesTags: ["Playlists"],
        }),
        delPlaylist: b.mutation({ query: (id) => ({ url: `/playlists/${id}`, method: "DELETE" }), invalidatesTags: ["Playlists"] }),
        myCourses: b.query({ query: () => "/courses/mine", providesTags: ["MyCourses"] }),
        addCourse: b.mutation({
            query: (body) => ({ url: "/courses", method: "POST", body }), invalidatesTags: ["MyCourses", "Courses"],
        }),
        removeCourse: b.mutation({
            query: (id) => ({ url: `/courses/${id}`, method: "DELETE" }), invalidatesTags: ["MyCourses", "Courses", "Path", "Reviews"],
        }),
    }),
});
export const { useCoursesQuery, usePathQuery, useEnrollMutation, useToggleMutation, useChecklistQuery, useAddItemMutation, useSetItemMutation, useDelItemMutation, useAddTargetMutation, useBumpTargetMutation, useDelTargetMutation, useDiaryQuery, useSaveEntryMutation, useMessagesQuery, useSendMutation, useDelMessageMutation, useReviewsQuery, useRateMutation, useDelReviewMutation, usePlaylistsQuery, useAddPlaylistMutation, useDelPlaylistMutation, useMyCoursesQuery, useAddCourseMutation, useRemoveCourseMutation, } = dataApi;
