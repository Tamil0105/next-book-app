export interface Event {
    id?: string;
    summary: string;
    location:string;
    guests:any;
    start: {
      dateTime?: string;
      date?: string;
    };
    end: {
      dateTime?: string;
      date?: string;
    };
  }
  