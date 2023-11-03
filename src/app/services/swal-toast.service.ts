import { Injectable } from '@angular/core';
declare let Swal:any;
@Injectable({
  providedIn: 'root'
})
export class SwalToastService {
   toast = Swal.mixin({
    toast: true,
    position: 'top-right',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  constructor() { }

  success(message:string){
this.toast.fire({
  icon:'success',
  title:message
})
  }

  error(message:string){
    this.toast.fire({
      icon:'error',
      title:message
    })
  }
  info(message:string){
    this.toast.fire({
      icon:'info',
      title:message
    })
  }
  infoPopUp(message:string){
    Swal.fire({
      title:'Alert!',
      text: message,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
  }
  erroalert()  
  {  
    Swal.fire({  
      icon: 'error',  
      title: 'Oops...',  
      text: 'Something went wrong!',  
      footer: '<a href>Why do I have this issue?</a>'  
    })  
  }  
}
