import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import { User } from 'src/app/models/user';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-list-users',
    templateUrl: './list-users.component.html',
    providers: [MessageService]
})
export class ListUsersComponent {

    user: User = new User;
    userDialog: boolean = false;

    roles = [
        { label: 'USER', value: 'USER' },
        { label: 'PERSONNEL', value: 'PERSONNEL' },
        { label: 'MAG TISSU', value: 'MAG TISSU' },
        { label: 'COUPE', value: 'COUPE' },
        { label: 'ADMIN', value: 'ADMIN' },
        { label: 'ST', value: 'ST' },
        { label: 'DELAVAGE', value: 'DELAVAGE' },
        { label: 'OWNER', value: 'OWNER' },
        { label: 'COLLECTION', value: 'COLLECTION' },
        { label: 'LMD', value: 'LMD' },
        { label: 'RMD', value: 'RMD' },
        { label: 'FINITION', value: 'FINITION' },
        { label: 'CHEF COUPE', value: 'CHEF COUPE' },
        { label: 'PRODUCTION', value: 'PRODUCTION' }
      ];
      
      



    deleteUserDialog: boolean = false;


   
    deleteUsersDialog: boolean = false;

   
    users: User[] = [];


  

    isDesktop : boolean = true ; 
    selectedUsers: User[] = [];

    loading : boolean = true ; 
    submitted: boolean = false;

    cols: any[] = [];

    statuses: any[] = [];

    cinPattern: RegExp = /^[0-9]{8}$/;
    adressePattern: RegExp = /^[a-zA-Z]+ [a-zA-Z]|[a-zA-Z 0-9]+$/;
    namePattern: RegExp = /^[a-zA-Z]+$/;
    telPattern: RegExp = /^[0-9]{8}$/;
    emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    datePattern: RegExp = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;

    rowsPerPageOptions = [5, 10, 20];

    constructor( private messageService: MessageService, private api: ApiService) { }

    ngOnInit() {
        
        this.api.getAllUser().subscribe(res => {
            this.users = res;
            this.loading = false ; 
            // console.log(this.users);
        },err=>{
            this.loading =false ; 
        })
        this.cols = [
            { field: 'product', header: 'Product' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' },
            { field: 'rating', header: 'Reviews' },
            { field: 'inventoryStatus', header: 'Status' }
        ];
        this.checkScreenSize();
        window.addEventListener('resize', this.checkScreenSize.bind(this));
    
        this.statuses = [
            { label: 'INSTOCK', value: 'instock' },
            { label: 'LOWSTOCK', value: 'lowstock' },
            { label: 'OUTOFSTOCK', value: 'outofstock' }
        ];
    }
    checkScreenSize() {
        this.isDesktop = window.innerWidth >= 768;  // Adjust this value for tablet/desktop breakpoint
    }
    openNew() {
        this.user = {
            id: 0,
            firstname: '',
            lastname: '',
            username: '', password: '',role : ''

        };
     
        this.submitted = false;
        this.userDialog = true;
   
    }

  
    deleteSelectedUsers() {
        this.deleteUsersDialog = true;
    }
    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }


 

   

    deleteUser(user: User) {
        this.deleteUserDialog = true;
        this.user = { ...user };
    }



    confirmDeleteSelected() {
        this.deleteUsersDialog = false;
        this.selectedUsers.forEach(user => {
            this.api.deletUser(user).subscribe(res=>{
            
            })
            
        });
        this.users = this.users.filter(val => !this.selectedUsers.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 3000 });
        this.selectedUsers = [];
    }

    confirmDelete() {
        this.deleteUserDialog = false;
        
        this.api.deletUser(this.user).subscribe(res => {
            this.users = this.users.filter(val => val.id !== this.user.id);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
            this.user = {
                id: 0,
                firstname: '',
                lastname: '',
                username: '', password: '',role : ''
    
            };
        })
       
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

  

    formValide(): boolean {
        // return this.namePattern.test(this.client.firstname) && this.namePattern.test(this.client.lastname) &&
        //   this.adressePattern.test(this.client.adresse)
        //   && this.emailPattern.test(this.client.email) &&
        //   this.cinPattern.test(this.client.cin) && this.telPattern.test(this.client.tel) &&
        //   this.datePattern.test(this.client.date_naissance);
        return true;
    }

    saveUser() {
        this.submitted = true;
        if (!this.formValide()) {
            return
        }

        if (
            this.user.firstname?.trim() &&
            this.user.lastname?.trim() &&
            this.user.username?.trim() 
        ) {
            if (this.user.id) {
                this.user.firstname = this.user.firstname;
                this.user.lastname = this.user.lastname;
                this.user.id = this.user.id;
               
                this.users[this.findIndexById(this.user.id.toString())] = this.user;

                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });;
                this.api.updateUser(this.user).subscribe(res => {
                    this.userDialog = false;
                }, error => {
                    alert(error.message);
                });
            } else {
                this.user.firstname = this.user.firstname;
                this.user.lastname = this.user.lastname;
                this.user.id = this.user.id;
                this.user.username = this.user.username ; 
                this.user.password = this.user.password ; 
                this.users.push(this.user);
                this.api.addUser(this.user).subscribe(res => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
                    this.getAllUsers();
                    this.userDialog = false;
                    this.user = {
                        id: 0,
                        firstname: '',
                        lastname: '',
                        username: '', password: '',role : ''
            
                    };
                }, error => {
                    alert(error.message);
                });
            }
            this.users = [...this.users];


        }
    }

    getAllUsers() {
        this.api.getAllUser().subscribe(res => {
            this.users = res;
        })
    }
    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id.toString() === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    
}
