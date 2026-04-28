import { Component, ElementRef, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@app/core/i18n/translate.pipe';
import { buildMonthGrid, formatDate, isValidIsoDate, MonthGridDay, startOfDay, toIsoDate } from '@app/shared/utils/date.utils';

@Component({
  selector: 'app-club-date-picker',
  imports: [TranslatePipe],
  templateUrl: './club-date-picker.html',
  styleUrl: './club-date-picker.css'
})
export class ClubDatePickerComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly value = input(toIsoDate(new Date()));
  readonly valueChange = output<string>();
  readonly isOpen = signal(false);
  readonly weekdays = [
    'calendar.day.mon',
    'calendar.day.tue',
    'calendar.day.wed',
    'calendar.day.thu',
    'calendar.day.fri',
    'calendar.day.sat',
    'calendar.day.sun',
  ];
  readonly viewMonth = signal(this.getMonthStart(startOfDay(new Date())));
  readonly selectedDate = computed(() => this.toDate(this.value()));
  readonly triggerLabel = computed(() =>
    formatDate(this.selectedDate(), {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );
  readonly selectedDateLabel = computed(() =>
    this.capitalize(
      formatDate(this.selectedDate(), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    )
  );
  readonly monthLabel = computed(() =>
    this.capitalize(
      formatDate(this.viewMonth(), {
        month: 'long',
        year: 'numeric',
      })
    )
  );
  readonly monthDays = computed(() => buildMonthGrid(this.viewMonth(), this.selectedDate()));

  constructor() {
    effect(() => {
      this.viewMonth.set(this.getMonthStart(this.selectedDate()));
    });
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }

    this.viewMonth.set(this.getMonthStart(this.selectedDate()));
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  showPreviousMonth(): void {
    const viewMonth = this.viewMonth();
    this.viewMonth.set(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  }

  showNextMonth(): void {
    const viewMonth = this.viewMonth();
    this.viewMonth.set(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  }

  selectDay(day: MonthGridDay): void {
    this.valueChange.emit(day.isoDate);
    this.close();
  }

  selectToday(): void {
    this.valueChange.emit(toIsoDate(new Date()));
    this.close();
  }

  dayButtonClass(day: MonthGridDay): string {
    const classes = [
      'relative',
      'flex',
      'h-11',
      'items-center',
      'justify-center',
      'rounded-2xl',
      'text-sm',
      'font-bold',
      'transition-all',
      'duration-200',
      'active:scale-95',
    ];

    if (day.isSelected) {
      classes.push(
        'bg-[linear-gradient(135deg,rgba(0,82,255,0.95),rgba(36,205,255,0.85))]',
        'text-white',
        'shadow-[0_16px_30px_rgba(0,82,255,0.28)]'
      );
      return classes.join(' ');
    }

    classes.push('text-white/90', 'hover:bg-white/8');

    if (!day.isCurrentMonth) {
      classes.push('text-white/25');
    }

    if (day.isToday) {
      classes.push('ring-1', 'ring-primary/30', 'bg-primary/10');
    }

    return classes.join(' ');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  private toDate(value: string): Date {
    if (!isValidIsoDate(value)) {
      return startOfDay(new Date());
    }

    return startOfDay(new Date(`${value}T00:00:00`));
  }

  private getMonthStart(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), 1);
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
