import {
  Component,
  inject,
  input,
  output,
  OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContractService } from "@/app/core/services/contract/contract.service";
import { ContractMutation } from "@/app/core/models/contract/contract.models";

@Component({
  selector: "app-mutation-form",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./mutation-form.component.html",
})
export class MutationFormComponent implements OnInit {
  private readonly service = inject(ContractService);

  contractId = input.required<number>();
  onCompleted = output<void>();

  mutations = signal<ContractMutation[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.findMutations(this.contractId(), { size: 20 }).subscribe({
      next: (res) => {
        if (res.success && res.data) this.mutations.set(res.data.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
