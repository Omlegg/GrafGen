import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export async function getConnection(token: string) {
    if (connection) return connection;

    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5166/grafgenhub", {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

    await connection.start();

    console.log("SignalR Connected");

    return connection;
}