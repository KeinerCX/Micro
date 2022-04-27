export const UsernameRegex = /^(?:[A-Z]|[a-z]|\d|\.|\_|\-){3,20}$/i

// Retreived from https://regexr.com/3bfsi on the 27th of April 2022
export const PasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm

// Retreived from https://www.emailregex.com/ on the 6th of October 2021
export const EmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const CustomEpoch: number | undefined = !process.env.EPOCH ? (process.env.EPOCH as undefined) : +process.env.EPOCH