export interface Category {id:string;name:string;icon:string;sort:number;published:boolean}
export interface Ingredient {id:string;name:string}
export interface Product {id:string;slug:string;name:string;description:string;categoryId:string;image:string;price:number;previousPrice:number|null;badge:string;ingredientIds:string[];published:boolean;available:boolean;sort:number;updatedAt?:unknown}
export interface Banner {id:string;image:string;alt:string;url:string;published:boolean;sort:number}
export interface Settings {name:string;description:string;phone:string;whatsapp:string;address:string;hours:string;makukUrl:string;sonbolUrl:string;mapsUrl:string;latitude:string;longitude:string;instagram:string;facebook:string;logo:string;welcomeImage:string;siteUrl:string}
export interface Review {id:string;productId:string;uid:string;rating:number;comment:string;status:'pending'|'approved'|'rejected';createdAt?:unknown;updatedAt?:unknown}
export interface ContactMessage {id:string;uid:string;name:string;phone:string;kind:string;message:string;status:'new'|'read'|'resolved';createdAt?:unknown}
export interface Catalog {categories:Category[];ingredients:Ingredient[];products:Product[];banners:Banner[];settings:Settings;reviews:Review[]}
export type AdminResource='categories'|'ingredients'|'products'|'banners'|'reviews'|'messages';
export interface AdminData extends Catalog {messages:ContactMessage[]}
