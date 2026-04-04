export interface DockerStatus {
    StatusCode: number;
}

export interface ObjectMap<T> {
    [key: string]: T;
}

export interface VerdictInfo {
    time?: number;
    message?: string;
}