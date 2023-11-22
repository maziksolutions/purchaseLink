import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SideNavService } from './sidenavi-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequisitionMasterService } from 'src/app/services/requisition-master.service';
import { SwalToastService } from 'src/app/services/swal-toast.service';
import { error } from 'console';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface CommentData {
  commentId: number;
  commentType: string;
  commentData: string;
};

declare var SideNavi: any;
@Component({
  selector: 'app-sidenavi-right',
  templateUrl: './sidenavi-right.component.html',
  styleUrls: ['./sidenavi-right.component.css']
})
export class SidenaviRightComponent implements OnInit, OnDestroy {
  commentsForm: FormGroup; flag; pkey: number = 0;
  comments: any[] = [];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  selectedComment: any = null;

  private destroy$ = new Subject<void>();

  constructor(private sideNaviService: SideNavService, private fb: FormBuilder, private reqService: RequisitionMasterService,
    private swal: SwalToastService, private activatedRoute: ActivatedRoute, private router: Router) {

    this.commentsForm = this.fb.group({
      commentId: 0,
      commentType: [''],
      commentData: ['', Validators.required]
    });
  }

  get fm() { return this.commentsForm.controls }

  ngOnInit(): void {
    this.loadData(0);
  }

  ngOnDestroy(): void {
    debugger;
    this.destroy$.next();
    this.destroy$.complete();
    this.sideNaviService.destroySidenav();
  }

  onSubmit(form: any) {
    debugger;
    if (form.value.commentId == null) {
      form.value.commentId = 0;
      form.value.commentType = this.sideNaviService.getCommetType();
    } else {
      debugger;
      const updatedComment = this.commentsForm.get('commentData')?.value;
      if (this.selectedComment && updatedComment) {
        form.value.commentData = updatedComment;
        console.log(form.value);
      }
    }
    this.reqService.addComments(form.value)
      .subscribe(data => {

        if (data.message == "data added") {
          this.swal.success('Added successfully.');
          this.clear();
          this.comments = [];
          this.loadData(0);
        }
        else if (data.message == "updated") {
          this.swal.success('Data has been updated successfully.');
          this.clear();
          this.comments = [];
          this.loadData(0);
        }
        else if (data.message == "duplicate") {
          this.swal.info('Data already exist. Please enter new data');
          this.comments = [];
          this.loadData(0);
        }
        else if (data.message == "not found") {
          this.swal.info('Data exist not exist');
          this.comments = [];
          this.loadData(0);
        }
        else {

        }
      },
        error => {
          debugger;
          console.error('Service error:', error);
        });
  }

  loadData(status: number) {
    debugger;
    // if (status == 1) {
    //   this.deletetooltip ='UnArchive';
    //   if ((document.querySelector('.fa-trash') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.add("fa-trash-restore", "text-primary");
    //     (document.querySelector('.fa-trash') as HTMLElement).classList.remove("fa-trash", "text-danger");
    //   }
    // }
    // else {
    //   this.deletetooltip='Archive';
    //   if ((document.querySelector('.fa-trash-restore') as HTMLElement) != null) {
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.add("fa-trash", "text-danger");
    //     (document.querySelector('.fa-trash-restore') as HTMLElement).classList.remove("fa-trash-restore", "text-primary");
    //   }
    // }
    this.reqService.getComments(status)
      .subscribe(response => {
        debugger;
        this.flag = status;
        var data = response.data;

        data.map(res => { this.comments.push({ commentId: res.commentId, commentData: res.commentData, commentType: res.commentType }) });

        this.dataSource.data = response.data;

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.clear();
        (document.getElementById('collapse1') as HTMLElement).classList.remove("show");
      });
  }

  editComment(comment: any): void {
    debugger;
    this.selectedComment = comment;
    this.commentsForm.patchValue({
      commentId: comment.commentId,
      commentData: comment.commentData,
      commentType: comment.commentType
    });
  }
  cancelUpdate() {
    this.commentsForm.reset();
}

  clear() {
    this.commentsForm.reset();
  }

}
