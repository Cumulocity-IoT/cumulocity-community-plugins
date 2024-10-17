import { Component, inject } from '@angular/core';
import { AlertService, gettext, OptionsService } from '@c8y/ngx-components';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PROMPT } from './prompt';
import { FetchClient } from '@c8y/client';
import Anthropic from '@anthropic-ai/sdk';
import { Router } from '@angular/router';

const AI_MODEL = 'claude-3-5-sonnet-20240620';

@Component({
  selector: 'c8y-simulator-modal',
  templateUrl: './simulator-modal.component.html',
})
export class SimulatorModalComponent {
  title = gettext('Add advanced simulator');
  useCase = '';
  appOptions = inject(OptionsService);
  apiKey = this.appOptions.get('apiKey');
  result: Promise<any> = new Promise((resolve, reject) => {
    this._close = resolve;
    this._reject = reject;
  });
  pending = false;
  instances = 1;
  details = '';
  private _close: ((_) => void) | undefined;
  private _reject: (reason?: any) => void;

  private modalRef = inject(BsModalRef);
  private client = inject(FetchClient);
  private alertService = inject(AlertService);
  private router = inject(Router);

  cancel() {
    this._reject();
    this.modalRef.hide();
  }

  async create() {
    try {
      this.pending = true;
      const message = this.instances + ' ' + this.useCase + '; ' + this.details;
      const { simulatorBody, usage } = await this.getSimulatorBodyForUsecase(
        message,
        this.apiKey
      );

      const promises = simulatorBody.map((body) =>
        this.createSimulator(this.client, body)
      );
      await Promise.all(promises);
      const inputTokensCost =
        Math.round((usage.input_tokens / 1_000_000) * 3 * 100) / 100;
      const outputTokensCost =
        Math.round((usage.output_tokens / 1_000_000) * 15 * 100) / 100;
      const detailedData = `
        Model used: ${AI_MODEL}
        Input tokens used: ${usage.input_tokens} (${inputTokensCost.toFixed(2)}$)
        Output tokens used: ${usage.output_tokens} (${outputTokensCost.toFixed(2)}$)
        Price: ${(Math.round((inputTokensCost + outputTokensCost) * 100) / 100).toFixed(2)}$
      `;
      this.alertService.add({
        text: 'Simulators created successfully',
        type: 'success',
        detailedData,
      });
      this._close!(null);
      this.modalRef.hide();
      const currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    } catch (e) {
      this.pending = false;
      this.alertService.addServerFailure(e);
    }
  }

  async getSimulatorBodyForUsecase(
    usecase: string,
    apiKey
  ): Promise<{
    simulatorBody: Array<any>;
    usage: { input_tokens: number; output_tokens: number };
  }> {
    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 8192,
      temperature: 0.3,
      system: PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: usecase,
            },
          ],
        },
      ],
    });

    const content: any = msg.content[0];
    const bodyAsString: string = content.text;

    return {
      simulatorBody: JSON.parse(bodyAsString),
      usage: msg.usage as { input_tokens: number; output_tokens: number },
    };
  }

  async createSimulator(
    client: FetchClient,
    body: any
  ): Promise<{ id: string; [key: string]: any }> {
    const response = await client.fetch(
      '/service/device-simulator/simulators',
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create simulator: ${response.statusText}`);
    }

    return response.json();
  }
}
