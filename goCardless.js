/**
  * Flips own implimentation of a GoCardless
  * NodeJs libary, as there is not currently
  * an official one published. This wrapper is
  * using the REST API libary that GoCardless
  * provides.

  * @author James Gibbons
  * @author Flip Multimedia
  
  * @version 1.0
  * @since 3.4.8

  * @requires Flip
  * @requires node-rest-sdk
*/

const rest_client = require('node-rest-client').Client;
const fs = require('fs');
const utils = require('../utils');

/**
  * Definitions of GoCardless API Url's.
*/
const api_urls = {
  redirect_flows: 'https://api.gocardless.com/redirect_flows'
};

module.exports = class GoCardless {

  /**
    * This constructor is used to load
    * the configuration file if it exists.
  */
  constructor(config_dir){
    if(fs.existsSync(config_dir)){
      if(typeof require(config_dir) == 'json' || typeof require(config_dir) == 'object'){
        this.config = require(config_dir);

        // Load the access token key.
        if(this.config.mode == 'sandbox') this.config.token = this.config.keys.sandbox;
        else if(this.config.mode == 'production') this.config.token = this.config.keys.production;

        // Log to console.
        if(this.config.mode == 'sandbox'){
          console.log('[Flip Gocardless] => Running in ' + this.config.mode);
          console.log('[Flip GoCardless] => Loaded configuration files.');
        }
      }
      else throw '[Flip GoCardless] => Invalid config file contents.';
    }
    else throw '[Flip GoCardless] => Invalid config file.';
  }

  /**
    * Used to create a new payment, and
    * payment ID.

    * @param payment The params containing the dd info.
    * @returns the_payment The created GoCardless payment.
  */
  create_dd_redirect_flow(payment, cb){
    if(payment && cb){
      // Generate a session ID for the payement.
      let session_id = utils.random(16);

      const client = new rest_client();
      let args = {
        data : {
          "redirect_flows": {
            "description": payment.description,
            "session_token": session_id,
            "success_redirect_url": payment.redirect_url,
            "prefilled_customer": payment.customer
          }
        },
        headers: {
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`
        }
      };

      // Post the request to GoCardless
      client.post(api_urls.redirect_flows, args, (data) => {

        // Check if there has been an error.
        if(typeof data.error !== 'undefined'){
          cb(JSON.stringify(data), null);
        }
        else{
          cb(null, data);
        }
      });
    }
    else throw '[Flip GoCardless] => Invalid dd payment param.';
  }
}
