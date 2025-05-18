import http from "../baseHttp";

export const fetchGroups = async () => {
        return await http.get('/groups')
}

